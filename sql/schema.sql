-- Inicialização de um banco vazio. Em bancos existentes confira SHOW CREATE TABLE.
CREATE TABLE IF NOT EXISTS usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('aluno', 'professor') NOT NULL,
    admin TINYINT(1) NOT NULL DEFAULT 0,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS disciplinas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS turmas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    codigo CHAR(6) NOT NULL UNIQUE,
    disciplina_id INT UNSIGNED NOT NULL,
    professor_id INT UNSIGNED NOT NULL,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
    FOREIGN KEY (professor_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS turma_alunos (
    turma_id INT UNSIGNED NOT NULL,
    aluno_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (turma_id, aluno_id),
    FOREIGN KEY (turma_id) REFERENCES turmas(id),
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS atividades (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    turma_id INT UNSIGNED NOT NULL,
    titulo VARCHAR(80) NOT NULL,
    descricao TEXT NOT NULL,
    tipo ENUM('atividade', 'prova', 'material', 'aviso') NOT NULL,
    data_entrega DATE NULL,
    FOREIGN KEY (turma_id) REFERENCES turmas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
