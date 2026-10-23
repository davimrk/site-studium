const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function cadastrarUsuario(nome, email, senha, perfil) {
    const [resultado] = await db.query(
        "insert into usuarios (nome, email, senha, perfil) values (?, ?, ?, ?)",
        [nome, email, senha, perfil]
    );

    return resultado.insertId;
}

async function buscarTurmasAluno(alunoId) {
    const [resultado] = await db.query(
        `select turmas.id, turmas.nome, disciplinas.nome as disciplina
         from turmas
         inner join turma_alunos on turmas.id = turma_alunos.turma_id
         inner join disciplinas on turmas.disciplina_id = disciplinas.id
         where turma_alunos.aluno_id = ?`,
        [alunoId]
    );

    return resultado;
}

async function buscarUsuarioEmail(email) {
    const [resultado] = await db.query(
        "select * from usuarios where email = ?",
        [email]
    );

    return resultado[0];
}

async function buscarUsuarioId(id) {
    const [resultado] = await db.query(
        "select id, nome, email, perfil from usuarios where id = ?",
        [id]
    );

    return resultado[0];
}

async function buscarTurmaCodigo(codigo) {
    const [resultado] = await db.query(
        "select * from turmas where codigo = ?",
        [codigo]
    );

    return resultado[0];
}

async function verificarMatricula(turmaId, alunoId) {
    const [resultado] = await db.query(
        "select * from turma_alunos where turma_id = ? and aluno_id = ?",
        [turmaId, alunoId]
    );

    return resultado[0];
}

async function matricularAluno(turmaId, alunoId) {
    const [resultado] = await db.query(
        "insert into turma_alunos (turma_id, aluno_id) values (?, ?)",
        [turmaId, alunoId]
    );

    return resultado.insertId;
}

async function buscarAtividadesAluno(alunoId) {
    const [resultado] = await db.query(
        `select atividades.id, atividades.titulo, atividades.descricao, atividades.tipo, atividades.data_entrega, turmas.nome as turma from atividades
         inner join turmas on atividades.turma_id = turmas.id
         inner join turma_alunos on turmas.id = turma_alunos.turma_id
         where turma_alunos.aluno_id = ?
         order by atividades.data_entrega`,
        [alunoId]
    );

    return resultado;
}

async function criarTurma(nome, codigo, professorId, disciplinaId) {
    const [resultado] = await db.query(
        "insert into turmas (nome, codigo, professor_id, disciplina_id) values (?, ?, ?, ?)",
        [nome, codigo, professorId, disciplinaId]
    );

    return resultado.insertId;
}

async function buscarDisciplina(nome) {
    const [resultado] = await db.query(
        "select * from disciplinas where nome = ?",
        [nome]
    );

    return resultado[0];
}

async function criarDisciplina(nome) {
    const [resultado] = await db.query(
        "insert into disciplinas (nome) values (?)",
        [nome]
    );

    return resultado.insertId;
}

module.exports = {
    cadastrarUsuario,
    buscarUsuarioEmail,
    buscarUsuarioId,
    matricularAluno,
    verificarMatricula,
    buscarTurmaCodigo,
    buscarTurmasAluno,
    buscarAtividadesAluno,
    criarTurma,
    buscarDisciplina,
    criarDisciplina
};
