class Usuario {
  constructor(id, nome, email, senha, perfil) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.perfil = perfil;
  }
}

class Turma {
  constructor(id, nome) {
    this.id = id;
    this.nome = nome;
    this.codigo = gerarCodigo();
    this.alunos = [];
    this.atividades = [];
  }
}

class GerenciadorUsuarios {
  constructor() {
    this.usuarios = [];
    this.id = 1;
  }

  cadastrar(nome, email, senha, perfil) {
    const user = new Usuario(this.id++, nome, email, senha, perfil);
    this.usuarios.push(user);
    return user;
  }

  login(email, senha) {
    return this.usuarios.find((u) => u.email === email && u.senha === senha);
  }
}

const usuarios = new GerenciadorUsuarios();

let usuarioLogado = null;
let modo = "cadastro";

document.getElementById("formconta").addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const perfil = document.getElementById("campo-perfil").value;

  if (modo === "cadastro") {
    usuarioLogado = usuarios.cadastrar(nome, email, senha, perfil);
  } else {
    usuarioLogado = usuarios.login(email, senha);
  }

  document.getElementById("nomeuser").textContent = usuarioLogado
    ? usuarioLogado.nome
    : "Visitante";
});

//rota de login
const form = document.getElementById("formconta");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

app.post("/api/login", (req, res) => {
  const { email, senha} = req.body;
  const usuario = usuarios.login(email, senha);
  if (!email || !senha) {
    return res.status(400).json({erro: "Email e senha são obrigatórios"}); 
}}
);

return res.status(401).json({ erro: 'Email ou senha inválidos'});
});
//fim da rota de login

//painel professor
