const { randomBytes } = require("node:crypto");
const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
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

async function listarTurmas() {
    const [dados] = await db.query("SELECT id, nome, codigo FROM turmas");
    return dados;
}

async function listarProfessores() {
    const [dados] = await db.query(
        "SELECT id, nome, email FROM usuarios WHERE perfil = 'professor'"
    );
    return dados;
}

async function listarAlunos() {
    const [dados] = await db.query(
        "SELECT id, nome, email FROM usuarios WHERE perfil = 'aluno'"
    );
    return dados;
}


async function listarTurmasProfessor(professorId) {
    const [turmas] = await db.execute(
        `SELECT t.id, t.nome, t.codigo, d.nome AS disciplina,
            (SELECT COUNT(*) FROM turma_alunos WHERE turma_id = t.id) AS alunos
         FROM turmas t JOIN disciplinas d ON d.id = t.disciplina_id
         WHERE t.professor_id = ? ORDER BY t.id`,
        [professorId]
    );
    return turmas;
}

async function listarAtividadesProfessor(professorId) {
    const [atividades] = await db.execute(
        `SELECT a.id, a.turma_id, a.titulo, a.tipo,
            DATE_FORMAT(a.data_entrega, '%Y-%m-%d') AS data
         FROM atividades a JOIN turmas t ON t.id = a.turma_id
         WHERE t.professor_id = ? ORDER BY a.data_entrega, a.id`,
        [professorId]
    );
    return atividades;
}

async function criarTurma(professorId, nome, disciplina) {
    const conexao = await db.getConnection();
    try {
        await conexao.beginTransaction();
        const [disciplinas] = await conexao.execute(
            "SELECT id FROM disciplinas WHERE nome = ? ORDER BY id LIMIT 1",
            [disciplina]
        );
        let disciplinaId;
        if (disciplinas.length > 0) {
            disciplinaId = disciplinas[0].id;
        } else {
            const [novaDisciplina] = await conexao.execute(
                "INSERT INTO disciplinas (nome) VALUES (?)", [disciplina]
            );
            disciplinaId = novaDisciplina.insertId;
        }

        const codigo = randomBytes(4).toString("hex").toUpperCase();
        const [turma] = await conexao.execute(
            "INSERT INTO turmas (nome, codigo, disciplina_id, professor_id) VALUES (?, ?, ?, ?)",
            [nome, codigo, disciplinaId, professorId]
        );
        await conexao.commit();
        return { id: turma.insertId, nome, disciplina, codigo, alunos: 0, atividades: [] };
    } catch (erro) {
        await conexao.rollback();
        throw erro;
    } finally {
        conexao.release();
    }
}

async function criarAtividade(professorId, turmaId, { titulo, tipo, data }) {
    const [resultado] = await db.execute(
        `INSERT INTO atividades (turma_id, titulo, descricao, tipo, data_entrega)
         SELECT id, ?, '', ?, ? FROM turmas WHERE id = ? AND professor_id = ?`,
        [titulo, tipo, data, turmaId, professorId]
    );
    return resultado.affectedRows ? resultado.insertId : null;
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
    listarTurmas,
    listarAlunos,
    listarProfessores,
    listarTurmasProfessor,
    listarAtividadesProfessor,
    criarTurma,
    criarAtividade
}