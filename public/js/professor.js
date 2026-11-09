class Turma {
    constructor(id, nome, disciplina) {
        this.id = id;
        this.nome = nome;
        this.disciplina = disciplina;
        this.codigo = gerarCodigo();
        this.alunos = 0;
        this.atividades = [];
    }

    exibir() {
        return `
            <div class="item-turma">
                <strong>${this.nome}</strong>
                <span>Código: ${this.codigo}</span>
                <span>${this.alunos} alunos • ${this.atividades.length} atividades</span>
            </div>
        `;
    }

    option() {
        return `<option value="${this.id}">${this.nome} - ${this.disciplina}</option>`;
    }
}

function gerarCodigo() {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let codigo = "";

    for (let i = 0; i < 6; i++) {
        const numero = Math.floor(Math.random() * caracteres.length);
        codigo += caracteres[numero];
    }

    return codigo;
}

class GerenciadorTurmas {
  constructor() {
    this.turmas = [];
    this.id = 1;
  }

  criar(nome, disciplina) {
    const turma = new Turma(this.id++, nome, disciplina);
    this.turmas.push(turma);
    return turma;
  }
}

const turmas = new GerenciadorTurmas();

function atualizarPainel() {
  document.getElementById("listaturmas").innerHTML = turmas.turmas
    .map((t) => t.exibir())
    .join("");

  document.getElementById("selturma").innerHTML =
    `<option value="">Selecione</option>` +
    turmas.turmas.map((t) => t.option()).join("");

  document.getElementById("qtTurmas").textContent = turmas.turmas.length;

  let totalAlunos = 0;
  let totalAtividades = 0;

  for (let i = 0; i < turmas.turmas.length; i++) {
    totalAlunos += turmas.turmas[i].alunos;
    totalAtividades += turmas.turmas[i].atividades.length;
  }

  document.getElementById("qtAlunos").textContent = totalAlunos;
  document.getElementById("qtAtividades").textContent = totalAtividades;

  let html = "";

  for (let i = 0; i < turmas.turmas.length; i++) {
    const turma = turmas.turmas[i];

    for (let j = 0; j < turma.atividades.length; j++) {
      const a = turma.atividades[j];

      html += `
        <div class="item-ativ">
          <strong>${a.titulo}</strong>
          <span>${turma.nome} • ${a.tipo} • ${a.data || ""}</span>
        </div>
      `;
    }
  }

  document.getElementById("listaAtividades").innerHTML = html;
}

document.getElementById("formturma").addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("nometurma").value;
  const disciplina = document.getElementById("materiaturma").value;

  turmas.criar(nome, disciplina);
  

  atualizarPainel();

  e.target.reset();
});

const nomeUser = document.getElementById("nomeuser");
const btnSair = document.getElementById("btnsair");

async function carregarNome() {
    try {
        const resposta = await fetch("/api/logado");
        if (!resposta.ok) {
            window.location.href = "/index.html";
            return
        }
        const dados = await resposta.json()

        if(dados.usuario.perfil !== "professor") {
            window.location.href = "/index.html"
        }

        nomeUser.textContent = dados.usuario.nome
    } catch (erro) {
        console.log(erro);
        window.location.href = "/index.html";
    }
}

btnSair.addEventListener("click", async () => {
    try {
        const resposta = await fetch("/api/auth/logout", {
            method: "POST"
        });

        if (!resposta.ok) {
            throw new Error("Não foi possível sair da conta");
        }

        window.location.href = "/index.html";

    } catch (erro) {
        console.error(erro);
        alert("Erro ao sair da conta.");
    }
});

document.getElementById("formativ").addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("selturma").value;
  const titulo = document.getElementById("tituloativ").value;
  const tipo = document.getElementById("seltipo").value;
  const data = document.getElementById("dataativ").value;

  const turma = turmas.turmas.find((t) => t.id == id);

  if (!turma) return;

  turma.atividades.push({ titulo, tipo, data });

  atualizarPainel();

  e.target.reset();
});


atualizarPainel();
carregarNome();