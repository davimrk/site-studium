class Usuario {
  constructor(id, nome, email, senha, perfil) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.perfil = perfil;
  }
}

class Gerenciador {
  constructor() {
    this.usuarios = [];
    this.proximoId = 1;
  }

  buscarEmail(email) {
    return this.usuarios.find(u => u.email === email);
  }

  cadastrar(nome, email, senha, perfil) {
    if (this.buscarEmail(email)) {
      mensagem.innerHTML = "E-mail já cadastrado";
      mensagem.style.color = "#870504"
      return null;
    }

    const usuario = new Usuario(this.proximoId++, nome, email, senha, perfil);
    this.usuarios.push(usuario);
    mensagem.innerHTML = "Conta criada com sucesso!";
    return usuario;
  }

  login(email, senha) {
    const usuario = this.buscarEmail(email);

    if (!usuario) {
      mensagem.innerHTML = "Usuário não encontrado";
      mensagem.style.color = "#870504"
      return null;
    }

    if (usuario.senha !== senha) {
      mensagem.innerHTML = "Senha incorreta!";
      mensagem.style.color = "#870504"
      return null;
    }

    mensagem.innerHTML = "Login realizado!";
    return usuario;
  }
}

const gerenciador = new Gerenciador();

const mensagem = document.getElementById("msg");
const nome = document.getElementById("nome");
const email = document.getElementById("email");
const senha = document.getElementById("senha");

document.getElementById("formconta").addEventListener("submit", (e) => {
  e.preventDefault();

  const perfil = document.getElementById("campo-perfil").value;

  if (modo === "cadastro") {
    gerenciador.cadastrar(nome.value, email.value, senha.value, perfil);
  } else {
    gerenciador.login(email.value, senha.value);
  }
});
