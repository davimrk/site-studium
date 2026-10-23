class Usuario {
  constructor(id, nome, email, perfil) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.perfil = perfil;
  }
}

class Turma {
  constructor(id, nome, codigo, disciplina, professor) {
    this.id = id;
    this.nome = nome;
    this.codigo = codigo;
    this.disciplina = disciplina;
    this.professor = professor;
  }
}

class GerenciadorAdm {
  constructor() {
    this.alunos = [];
    this.professores = [];
    this.turmas = [];
  }

  adicionarTurma(turma) {
    this.turmas.push(turma);
  }
  listarTurmas() {
    return this.turmas;
  }

  async buscarTurmas() {
    const resposta = await fetch("/api/adm/turmas");
    const dados = await resposta.json();
    this.turmas = dados;

    totalTurmas.textContent = this.turmas.length;
  }

  exibirTurmas() {
    tabela.innerHTML = "";
    this.turmas.forEach((turma) => {
      tabela.innerHTML += `
        <tr>
            <td>${turma.id}</td>
            <td>${turma.nome}</td>
            <td>${turma.codigo}</td>
        </tr>
    `;
    });
  }
  async buscarProfessores() {
    const resposta = await fetch("/api/adm/professores");
    const dados = await resposta.json();
    this.professores = dados;

    totalProf.textContent = this.professores.length;
  }

  exibirProfessores() {
    tabela.innerHTML = "";
    this.professores.forEach((professor) => {
      tabela.innerHTML += `
            <tr>
            <td>${professor.id}</td>
            <td>${professor.nome}</td>
        </tr>
        `;
    });
  }

  async buscarAlunos() {
    const resposta = await fetch("/api/adm/alunos");
    const dados = await resposta.json();
    this.alunos = dados;

    elementoTotal.textContent = this.alunos.length;
  }

  exibirAlunos() {
    tabela.innerHTML = "";
    this.alunos.forEach((aluno) => {
      tabela.innerHTML += `
      <tr>
        <td>${aluno.id}</td>
        <td>${aluno.nome}</td>
      </tr>
      `;
    });
  }
}

const gerenciador = new GerenciadorAdm();

const elementoTotal = document.getElementById("total-alunos");
const totalProf = document.getElementById("total-professores");
const totalTurmas = document.getElementById("total-turmas");

const tabela = document.getElementById("registros");
const botao = document.getElementById("atualizar");
const categorias = document.querySelectorAll("[data-categoria]");
const categoria = botao.dataset.categoria;

botao.addEventListener("click", async () => {
  await Promise.all([
    gerenciador.buscarTurmas(),
    gerenciador.buscarAlunos(),
    gerenciador.buscarProfessores(),
  ]);
});

categorias.forEach((botao) => {
  botao.addEventListener("click", () => {
    console.log(botao.dataset.categoria);
  });
});

categorias.forEach((botao) => {
  botao.addEventListener("click", () => {
    const categoria = botao.dataset.categoria;

    if (categoria === "turmas") {
      gerenciador.exibirTurmas();
    }

    if (categoria === "professores") {
      gerenciador.exibirProfessores();
    }

    if (categoria === "alunos") {
      gerenciador.exibirAlunos();
    }
  });
});

gerenciador.exibirTurmas();
gerenciador.exibirProfessores();
gerenciador.exibirAlunos();
