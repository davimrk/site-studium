
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");

require("dotenv").config({ quiet: true });

const {
    cadastrarUsuario,
    buscarUsuarioEmail,
    buscarUsuarioId,
    matricularAluno,
    verificarMatricula,
    buscarTurmaCodigo,
    buscarTurmasAluno,
    buscarAtividadesAluno,
    listarAlunos,
    listarProfessores,
    listarTurmas,
    listarTurmasProfessor,
    listarAtividadesProfessor,
    criarTurma,
    criarAtividade,
    consultar
} = require("./db.js");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "img")));
app.use("/fonts", express.static(path.join(__dirname, "fonts")));
 
const opcoesCookies = {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
};
 
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("Configure uma chave JWT com pelo menos 32 caracteres");
}

function usuarioPublico({ id, nome, email, perfil }) {
    return { id, nome, email, perfil };
}

async function buscarUsuarioDaSessao(token) {
    if (!token) return null;

    let dados;
    try {
        dados = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    } catch {
        return null;
    }

    return buscarUsuarioId(dados.id);
}

async function verificarToken(req, res, next) {
    const usuario = await buscarUsuarioDaSessao(req.cookies.token);
    if (!usuario) {
        return res.status(401).json({ mensagem: "Faça login para continuar." });
    }

    req.usuario = usuarioPublico(usuario);
    next();
}

app.get(["/", "/index.html"], async (req, res) => {
    res.set("Cache-Control", "no-store");
    const usuario = await buscarUsuarioDaSessao(req.cookies.token);

    if (usuario) {
        if (usuario.perfil === "admin") return res.redirect("/adm.html");
        if (usuario.perfil === "professor") return res.redirect("/professor.html");
        if (usuario.perfil === "aluno") return res.redirect("/aluno.html");
    }

    res.sendFile(path.join(__dirname, "privado", "index.html"));
});

function exigirPerfil(perfil) {
    return (req, res, next) => {
        if (req.usuario.perfil !== perfil) {
            return res.status(403).json({ mensagem: "Acesso não permitido." });
        }
        next();
    };
}

const somenteAluno = exigirPerfil("aluno");
const somenteProfessor = exigirPerfil("professor");
const somenteAdmin = exigirPerfil("admin");

app.post("/api/cadastro", async (req, res) => {
    try {
        const { nome, email, senha, perfil } = req.body ?? {};
 
        if (![nome, email, senha].every(valor => typeof valor === "string" && valor.trim()) || !perfil || Buffer.byteLength(senha) > 72) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos e use uma senha de até 72 bytes."
            });
        }
 
        if (perfil !== "aluno" && perfil !== "professor") {
            return res.status(400).json({
                mensagem: "Perfil inválido"
            });
        }
 
        const usuarioExiste = await buscarUsuarioEmail(email.trim());
 
        if (usuarioExiste) {
            return res.status(400).json({
                mensagem: "Email já cadastrado"
            });
        }
 
        const senhaHash = await bcrypt.hash(senha, 10);
        const id = await cadastrarUsuario(nome.trim(), email.trim(), senhaHash, perfil);
 
        res.status(201).json({
            mensagem: "Cadastro realizado com sucesso!",
                usuario: {
                    id: id,
                    nome: nome,
                    email: email,
                    perfil: perfil
                    }
        });
 
    } catch (erro) {
        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ mensagem: "Email já cadastrado" });
        }
        console.error(erro.code || erro.name);

        res.status(500).json({
            mensagem: "Erro ao cadastrar usuário"
        });
    }
});

function login(administrativo = false) {
    return async (req, res) => {
        const { email, senha } = req.body ?? {};
        if (typeof email !== "string" || !email.trim() || typeof senha !== "string" || !senha) {
            return res.status(400).json({ mensagem: "Email e senha são obrigatórios" });
        }

        const usuario = await buscarUsuarioEmail(email.trim());
        if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
            return res.status(401).json({ mensagem: "Email ou senha incorretos" });
        }

        const dados = usuarioPublico(usuario);
        if (administrativo && dados.perfil !== "admin") {
            return res.status(403).json({ mensagem: "Acesso administrativo não autorizado" });
        }

        const token = jwt.sign({ id: dados.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRA_EM || "1h"
        });
        res.cookie("token", token, {
            ...opcoesCookies,
            expires: new Date(jwt.decode(token).exp * 1000)
        });
        res.json({ mensagem: "Login realizado com sucesso!", usuario: dados });
    };
}

app.post("/api/login", login());
app.post("/api/admin/login", login(true));

app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token", opcoesCookies);
 
    res.json({
        mensagem: "Logout efetuado!"
    });
});
 
app.get("/api/logado", verificarToken, (req, res) => {
    res.json({ usuario: req.usuario });
});

app.post("/api/turmas/entrar", verificarToken, somenteAluno, async (req, res) => {
    const usuario = req.usuario;
    try {
        const codigo = String(req.body?.codigo || "").trim().toUpperCase();
        if (!codigo) {
            return res.status(400).json({ mensagem: "Digite o código da turma." });
        }

        const turma = await buscarTurmaCodigo(codigo);
        if (!turma) {
            return res.status(400).json({ mensagem: "Turma não encontrada." });
        }

        if (await verificarMatricula(turma.id, usuario.id)) {
            return res.status(409).json({ mensagem: "Você já está matriculado nesta turma!" });
        }

        await matricularAluno(turma.id, usuario.id);
        res.status(201).json({
            mensagem: "Você entrou na turma com sucesso!",
            turma: { id: turma.id, nome: turma.nome }
        });
    } catch (erro) {
        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensagem: "Você já está matriculado nessa turma."
            });
        }

        console.error(erro.code || erro.name);

        res.status(500).json({
            mensagem: "Erro ao entrar na turma."
        });
    }
});

app.get("/api/minhas-turmas", verificarToken, somenteAluno, async (req, res) => {
    res.json(await buscarTurmasAluno(req.usuario.id));
});

app.get("/api/minhas-atividades", verificarToken, somenteAluno, async (req, res) => {
    res.json(await buscarAtividadesAluno(req.usuario.id));
});

app.get("/api/professor/turmas", verificarToken, somenteProfessor, async (req, res) => {
    const turmas = await listarTurmasProfessor(req.usuario.id);
    const atividades = await listarAtividadesProfessor(req.usuario.id);
    for (const turma of turmas) {
        turma.atividades = atividades.filter(atividade => atividade.turma_id === turma.id);
    }
    res.json(turmas);
});

app.post("/api/professor/turmas", verificarToken, somenteProfessor, async (req, res) => {
    const { nome, disciplina } = req.body ?? {};
    if (![nome, disciplina].every(valor => typeof valor === "string" && valor.trim() && valor.trim().length <= 100)) {
        return res.status(400).json({ mensagem: "Informe nome e disciplina, com até 100 caracteres cada." });
    }

    const turma = await criarTurma(req.usuario.id, nome.trim(), disciplina.trim());
    res.status(201).json(turma);
});

app.post("/api/atividades", verificarToken, somenteProfessor, async (req, res) => {
    const { turmaId, titulo, tipo, data, descricao = "" } = req.body ?? {};
    if (!Number.isSafeInteger(turmaId) || turmaId < 1 ||
        typeof titulo !== "string" || !titulo.trim() || titulo.trim().length > 150 ||
        typeof descricao !== "string" || descricao.length > 5000 ||
        (tipo !== "atividade" && tipo !== "prova")) {
        return res.status(400).json({ mensagem: "Informe uma turma, um título válido e o tipo." });
    }

    if (data !== null && data !== undefined && data !== "") {
        const convertida = typeof data === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data)
            ? new Date(data + "T00:00:00Z") : null;
        if (!convertida || Number.isNaN(convertida.getTime()) ||
            convertida.toISOString().slice(0, 10) !== data || data < "1000-01-01") {
            return res.status(400).json({ mensagem: "Informe uma data de entrega válida." });
        }
    }

    const atividade = { titulo: titulo.trim(), tipo, data: data || null, descricao: descricao.trim() };
    const id = await criarAtividade(req.usuario.id, turmaId, atividade);
    if (!id) {
        return res.status(404).json({ mensagem: "Turma não encontrada." });
    }
    res.status(201).json({ id, ...atividade });
});

async function abrirTurma(req, res, next) {
    const [turma] = await consultar(
        `SELECT t.id, t.nome, t.codigo, t.professor_id, d.nome AS disciplina
         FROM turmas t JOIN disciplinas d ON d.id = t.disciplina_id WHERE t.id = ?`,
        [req.params.turma]
    );

    if (turma && req.usuario.perfil === "professor" && turma.professor_id === req.usuario.id) {
        req.turma = turma;
        return next();
    }

    if (turma && req.usuario.perfil === "aluno" && await verificarMatricula(turma.id, req.usuario.id)) {
        req.turma = turma;
        return next();
    }

    res.status(404).json({ mensagem: "Turma não encontrada." });
}

app.get("/api/turmas/:turma", verificarToken, abrirTurma, async (req, res) => {
    const id = req.turma.id;
    const atividades = await consultar(
        "SELECT id, titulo, tipo FROM atividades WHERE turma_id = ? ORDER BY data_entrega, id", [id]
    );
    const materiais = await consultar("SELECT titulo, descricao, arquivo FROM materiais WHERE turma_id = ?", [id]);
    const avisos = await consultar("SELECT titulo, mensagem FROM avisos WHERE turma_id = ? ORDER BY id DESC", [id]);
    const professor = req.usuario.perfil === "professor";
    const alunos = professor ? await consultar(
        `SELECT u.nome FROM usuarios u JOIN turma_alunos m ON m.aluno_id = u.id
         WHERE m.turma_id = ? ORDER BY u.nome`, [id]
    ) : [];

    res.json({ turma: req.turma, atividades, materiais, avisos, alunos, professor });
});

app.post("/api/turmas/:turma/publicacoes", verificarToken, somenteProfessor, abrirTurma, async (req, res) => {
    const { tipo, titulo, texto, arquivo = "" } = req.body ?? {};
    if (typeof titulo !== "string" || !titulo.trim() || titulo.length > 150 ||
        typeof texto !== "string" || !texto.trim() || texto.length > 5000) {
        return res.status(400).json({ mensagem: "Preencha o título e o texto." });
    }
    if (tipo === "material") {
        if (typeof arquivo !== "string" || arquivo.length > 255 || (arquivo && !/^https?:\/\//i.test(arquivo))) {
            return res.status(400).json({ mensagem: "Use um link iniciado por http:// ou https://." });
        }
        await consultar("INSERT INTO materiais (turma_id, titulo, descricao, arquivo) VALUES (?, ?, ?, ?)",
            [req.turma.id, titulo.trim(), texto.trim(), arquivo || null]);
    } else if (tipo === "aviso") {
        await consultar("INSERT INTO avisos (turma_id, titulo, mensagem) VALUES (?, ?, ?)",
            [req.turma.id, titulo.trim(), texto.trim()]);
    } else {
        return res.status(400).json({ mensagem: "Escolha material ou aviso." });
    }
    res.status(201).json({ mensagem: "Publicação criada." });
});

async function abrirAtividade(req, res, next) {
    const [atividade] = await consultar(
        `SELECT id, turma_id, titulo, tipo, descricao, DATE_FORMAT(data_entrega, '%d/%m/%Y') AS prazo
         FROM atividades WHERE id = ? AND turma_id = ?`, [req.params.atividade, req.turma.id]
    );
    if (!atividade) return res.status(404).json({ mensagem: "Atividade não encontrada." });
    req.atividade = atividade;
    next();
}

const rotaAtividade = "/api/turmas/:turma/atividades/:atividade";

app.get(rotaAtividade, verificarToken, abrirTurma, abrirAtividade, async (req, res) => {
    const professor = req.usuario.perfil === "professor";
    if (professor) {
        const entregas = await consultar(
            `SELECT e.id, u.nome, e.resposta, e.nota FROM entregas e
             JOIN usuarios u ON u.id = e.aluno_id WHERE e.atividade_id = ? ORDER BY u.nome`, [req.atividade.id]
        );
        return res.json({ atividade: req.atividade, professor, entregas });
    }

    const [entrega] = await consultar(
        "SELECT resposta, nota FROM entregas WHERE atividade_id = ? AND aluno_id = ?",
        [req.atividade.id, req.usuario.id]
    );
    res.json({ atividade: req.atividade, professor, entrega });
});

app.post(rotaAtividade + "/entrega", verificarToken, somenteAluno, abrirTurma, abrirAtividade, async (req, res) => {
    const resposta = req.body?.resposta;
    if (typeof resposta !== "string" || !resposta.trim() || resposta.length > 10000) {
        return res.status(400).json({ mensagem: "Escreva uma resposta de até 10 mil caracteres." });
    }

    try {
        await consultar("INSERT INTO entregas (atividade_id, aluno_id, resposta) VALUES (?, ?, ?)",
            [req.atividade.id, req.usuario.id, resposta.trim()]);
    } catch (erro) {
        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ mensagem: "Você já enviou esta atividade." });
        }
        throw erro;
    }

    res.status(201).json({ mensagem: "Resposta enviada." });
});

app.post(rotaAtividade + "/nota", verificarToken, somenteProfessor, abrirTurma, abrirAtividade, async (req, res) => {
    const { entregaId, nota } = req.body ?? {};
    if (!Number.isInteger(entregaId) || entregaId < 1 || !Number.isFinite(nota) || nota < 0 || nota > 10) {
        return res.status(400).json({ mensagem: "Informe uma nota de 0 a 10." });
    }

    const resultado = await consultar("UPDATE entregas SET nota = ? WHERE id = ? AND atividade_id = ?",
        [nota, entregaId, req.atividade.id]);
    if (!resultado.affectedRows) return res.status(404).json({ mensagem: "Entrega não encontrada." });
    res.json({ mensagem: "Nota salva." });
});

app.get("/api/admin/turmas", verificarToken, somenteAdmin, async (req, res) => {
    try {
        res.json(await listarTurmas());
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao consultar turmas" });
    }
});

app.get("/api/admin/professores", verificarToken, somenteAdmin, async (req, res) => {
    try {
        res.json(await listarProfessores());
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao consultar professores" });
    }
});

app.get("/api/admin/alunos", verificarToken, somenteAdmin, async (req, res) => {
    try {
        const alunos = await listarAlunos();
        res.json(alunos)
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao consultar alunos" });
    }
});

app.get("/adm.html", verificarToken, somenteAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "privado", "adm.html"));
});

app.use((erro, req, res, next) => {
    if (res.headersSent) return next(erro);
    if (erro.type === "entity.parse.failed") {
        return res.status(400).json({ mensagem: "JSON inválido." });
    }
    console.error(erro.code || erro.name);
    res.status(500).json({ mensagem: "Não foi possível concluir a operação." });
});

const porta = Number(process.env.PORT || 3000);
app.listen(porta, () => console.log("Servidor rodando na porta " + porta));
