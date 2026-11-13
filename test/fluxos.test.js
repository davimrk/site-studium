const { test } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const db = require("../db");

process.env.JWT_SECRET = "segredo-exclusivo-para-testes-locais";
process.env.JWT_EXPIRA_EM = "1h";
process.env.NODE_ENV = "test";

test("sessão, admin, turmas e atividades pela API HTTP", async contexto => {
    const senha = await bcrypt.hash("senha-de-teste", 4);
    const usuarios = [
        { id: 1, nome: "Prof", email: "prof@teste.com", senha, perfil: "admin" },
        { id: 2, nome: "Aluno", email: "aluno@teste.com", senha, perfil: "aluno" }
    ];
    const turmas = [];
    const atividades = [];
    const matriculas = [];
    contexto.mock.method(db, "buscarUsuarioEmail", async email => usuarios.find(u => u.email === email));
    contexto.mock.method(db, "buscarUsuarioId", async id => usuarios.find(u => u.id === id));
    contexto.mock.method(db, "listarTurmas", async () => turmas);
    contexto.mock.method(db, "buscarTurmaCodigo", async codigo => turmas.find(t => t.codigo === codigo));
    contexto.mock.method(db, "verificarMatricula", async (turma, aluno) =>
        matriculas.some(m => m.turma === turma && m.aluno === aluno));
    contexto.mock.method(db, "matricularAluno", async (turma, aluno) => matriculas.push({ turma, aluno }));
    contexto.mock.method(db, "criarTurma", async (professor, nome, disciplina) => {
        const turma = { id: 1, professor, nome, disciplina, codigo: "ABC123", alunos: 0 };
        turmas.push(turma);
        return { ...turma, atividades: [] };
    });
    contexto.mock.method(db, "listarTurmasProfessor", async professor => turmas.filter(t => t.professor === professor));
    contexto.mock.method(db, "listarAtividadesProfessor", async () => atividades);
    contexto.mock.method(db, "criarAtividade", async (professor, turmaId, atividade) => {
        if (!turmas.some(t => t.id === turmaId && t.professor === professor)) return null;
        return atividades.push({ id: 1, turma_id: turmaId, ...atividade });
    });
    contexto.mock.method(db, "buscarAtividadesAluno", async aluno =>
        atividades.filter(a => matriculas.some(m => m.aluno === aluno && m.turma === a.turma_id)));

    const entregas = [];
    contexto.mock.method(db, "consultar", async (sql, valores) => {
        if (sql.includes("FROM turmas t JOIN")) {
            return turmas.filter(t => t.id === Number(valores[0])).map(t => ({ ...t, professor_id: t.professor }));
        }
        if (sql.includes("FROM atividades WHERE id")) {
            return atividades.filter(a => a.id === Number(valores[0]) && a.turma_id === valores[1]);
        }
        if (sql.startsWith("INSERT INTO entregas")) {
            if (entregas.length) throw Object.assign(new Error(), { code: "ER_DUP_ENTRY" });
            entregas.push({ id: 1, resposta: valores[2], nota: null });
            return { affectedRows: 1 };
        }
        if (sql.startsWith("UPDATE entregas")) {
            entregas[0].nota = valores[0];
            return { affectedRows: 1 };
        }
        if (sql.includes("FROM entregas")) return entregas;
        return [];
    });
    const iniciarServidor = express.application.listen;
    let servidor;
    contexto.mock.method(express.application, "listen", function () {
        servidor = iniciarServidor.call(this, 0, "127.0.0.1");
        return servidor;
    });
    require("../server");
    contexto.after(() => servidor.close());
    await new Promise(resolve => servidor.once("listening", resolve));
    const base = `http://127.0.0.1:${servidor.address().port}`;
    function requisicao(rota, corpo, cookie) {
        return fetch(base + rota, {
            redirect: "manual",
            method: corpo === undefined ? "GET" : "POST",
            headers: { "Content-Type": "application/json", Cookie: cookie || "" },
            body: JSON.stringify(corpo)
        });
    }
    const status = async (codigo, ...args) => {
        const resposta = await requisicao(...args);
        assert.equal(resposta.status, codigo, args[0]);
        return resposta;
    };

    const visitante = await status(200, "/");
    assert.equal(visitante.headers.get("cache-control"), "no-store");
    await status(200, "/index.html");
    await status(200, "/index.html", undefined, "token=invalido");

    await status(401, "/adm.html");
    await status(401, "/api/atividades", {});
    await status(400, "/api/cadastro", { nome: "Teste", email: "t@teste.com", senha: "teste", perfil: "admin" });
    await status(401, "/api/login", { email: usuarios[0].email, senha: "errada" });
    const expirado = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: -1 });
    await status(401, "/api/minhas-turmas", undefined, "token=" + expirado);
    const credenciais = usuario => ({ email: usuario.email, senha: "senha-de-teste" });
    await status(403, "/api/admin/login", credenciais(usuarios[1]));
    const loginAluno = await status(200, "/api/login", credenciais(usuarios[1]));
    const aluno = loginAluno.headers.get("set-cookie").split(";")[0];
    await status(403, "/api/admin/turmas", undefined, aluno);
    await status(403, "/api/atividades", {}, aluno);

    const loginAdmin = await status(200, "/api/admin/login", credenciais(usuarios[0]));
    const cookie = loginAdmin.headers.get("set-cookie");
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Strict/);
    const prof = cookie.split(";")[0];
    const homeAluno = await status(302, "/", undefined, aluno);
    assert.equal(homeAluno.headers.get("location"), "/aluno.html");
    const homeAdmin = await status(302, "/index.html", undefined, prof);
    assert.equal(homeAdmin.headers.get("location"), "/adm.html");
    await status(200, "/adm.html", undefined, prof);
    const sessao = await status(200, "/api/logado", undefined, prof);
    assert.deepEqual((await sessao.json()).usuario, {
        id: 1, nome: "Prof", email: usuarios[0].email, perfil: "admin"
    });
    usuarios[0].perfil = "professor";
    const homeProfessor = await status(302, "/index.html", undefined, prof);
    assert.equal(homeProfessor.headers.get("location"), "/professor.html");
    await status(403, "/api/admin/turmas", undefined, prof);
    await status(201, "/api/professor/turmas", { nome: "2º ano B", disciplina: "Física" }, prof);
    const atividade = { turmaId: 1, titulo: "Lista 5", tipo: "atividade", data: "2026-12-01" };
    await status(404, "/api/atividades", { ...atividade, turmaId: 2 }, prof);
    await status(400, "/api/atividades", { ...atividade, data: "2026-02-30" }, prof);
    await status(201, "/api/atividades", atividade, prof);
    const painel = await status(200, "/api/professor/turmas", undefined, prof);
    assert.equal((await painel.json())[0].atividades[0].titulo, atividade.titulo);
    const antes = await status(200, "/api/minhas-atividades", undefined, aluno);
    assert.deepEqual(await antes.json(), []);
    const rotaAtividade = "/api/turmas/1/atividades/1";
    await status(404, rotaAtividade, undefined, aluno);
    await status(201, "/api/turmas/entrar", { codigo: "abc123" }, aluno);
    await status(409, "/api/turmas/entrar", { codigo: "ABC123" }, aluno);
    const depois = await status(200, "/api/minhas-atividades", undefined, aluno);
    assert.equal((await depois.json())[0].titulo, atividade.titulo);
    await status(200, "/turma.html");
    await status(200, "/atividade.html");
    await status(200, "/api/turmas/1", undefined, aluno);
    await status(200, rotaAtividade, undefined, aluno);
    await status(403, rotaAtividade + "/nota", { entregaId: 1, nota: 9 }, aluno);
    await status(201, rotaAtividade + "/entrega", { resposta: "Minha resposta" }, aluno);
    await status(409, rotaAtividade + "/entrega", { resposta: "Outra resposta" }, aluno);
    await status(400, rotaAtividade + "/nota", { entregaId: 1, nota: 11 }, prof);
    await status(200, rotaAtividade + "/nota", { entregaId: 1, nota: 9 }, prof);
    const corrigida = await status(200, rotaAtividade, undefined, aluno);
    assert.equal((await corrigida.json()).entrega.nota, 9);
    const logout = await status(200, "/api/auth/logout", {}, aluno);
    assert.match(logout.headers.get("set-cookie"), /^token=;/);
});
