class Turma {
  constructor(id, nome) {
    this.id = id;
    this.nome = nome;
    this.alunos = 0;
    this.atividades = [];
  }

  exibir() {
    return `
      <div class="item-turma">
        <strong>${this.nome}</strong>
        <span>${this.alunos} alunos • ${this.atividades.length} atividades</span>
      </div>
    `;
  }

  option() {
    return `<option value="${this.id}">${this.nome}</option>`;
  }
}

class GerenciadorTurmas {
  constructor() {
    this.turmas = [];
    this.id = 1;
  }

  criar(nome) {
    const turma = new Turma(this.id++, nome);
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

  turmas.criar(nome);

  atualizarPainel();

  e.target.reset();
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

turmas.criar("3º Ano B - Física").alunos = 32;
turmas.criar("3º Ano B - Português").alunos = 28;
turmas.criar("3º Ano B - História").alunos = 30;

turmas.turmas[0].atividades.push({
  titulo: "Prova de Óptica",
  tipo: "prova",
  data: "28/09",
});
turmas.turmas[1].atividades.push({
  titulo: "Redação",
  tipo: "atividade",
  data: "22/09",
});
turmas.turmas[2].atividades.push({
  titulo: "Revolução Francesa",
  tipo: "atividade",
  data: "30/09",
});

atualizarPainel();
