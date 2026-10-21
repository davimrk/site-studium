import mysql from "mysql2/promise";
import "dotenv/config";

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function cadastrarUsuario(nome, email, senhaHash, perfil) {
  const sql = `
    INSERT INTO usuarios (nome, email, senha, perfil)
    VALUES (?, ?, ?, ?)
  `;

  const [resultado] = await db.execute(sql, [nome, email, senhaHash, perfil]);
  return resultado.insertId;
}

export async function buscarUsuarioEmail(email) {
  const sql = "SELECT * FROM usuarios WHERE email = ?";
  const [resultado] = await db.execute(sql, [email]);
  return resultado[0];
}

export async function buscarUsuarioId(id) {
  const sql = `
    SELECT id, nome, email, perfil
    FROM usuarios
    WHERE id = ?
  `;

  const [resultado] = await db.execute(sql, [id]);
  return resultado[0];
}
