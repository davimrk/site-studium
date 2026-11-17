const nomeUser = document.getElementById("nomeuser");
const seletorTurma = document.getElementById("selturma");
const formTurma = document.getElementById("formturma");
const formAtividade = document.getElementById("formativ");

const botaoTurma = formTurma.querySelector('button[type="submit"]');
const botaoAtividade = formAtividade.querySelector('button[type="submit"]');
const avisoTurma = document.getElementById("msgturma");
const avisoAtividade = document.getElementById("msgativ");

let turmas = [];

function criarCard(classe, titulo, detalhes) {
  const card = document.createElement("div");
  card.className = classe;

  const nome = document.createElement("strong");
  nome.textContent = titulo;
  card.append(nome);

  for (let i = 0; i < detalhes.length; i++) {
    const linha = document.createElement("span");
    linha.textContent = detalhes[i];
    card.append(linha);
  }

  return card;
}

function atualizarPainel() {
  const turmaSelecionada = seletorTurma.value;
  const listaTurmas = document.getElementById("listaturmas");
  const listaAtividades = document.getElementById("listaAtividades");

  listaTurmas.textContent = "";
  listaAtividades.textContent = "";
  seletorTurma.textContent = "";

  const opcaoInicial = document.createElement("option");
  opcaoInicial.value = "";
  opcaoInicial.textContent = "Selecione";
  seletorTurma.append(opcaoInicial);

  let totalAlunos = 0;
  let totalAtividades = 0;

  for (let i = 0; i < turmas.length; i++) {
    const turma = turmas[i];

    totalAlunos += Number(turma.alunos);
    totalAtividades += turma.atividades.length;

    const opcao = document.createElement("option");
    opcao.value = turma.id;
    opcao.textContent = turma.nome + " - " + turma.disciplina;
    seletorTurma.append(opcao);

    const cardTurma = criarCard("item-turma", turma.nome, [
      "Código: " + turma.codigo,
      turma.alunos + " alunos - " + turma.atividades.length + " atividades",
    ]);

    const link = document.createElement("a");
    link.href = "/turma.html?id=" + turma.id;
    link.textContent = "Abrir turma";
    cardTurma.append(link);
    listaTurmas.append(cardTurma);

    for (let j = 0; j < turma.atividades.length; j++) {
      const atividade = turma.atividades[j];
      let detalhes = turma.nome + " - " + atividade.tipo;

      if (atividade.data) {
        detalhes += " - " + atividade.data;
      }

      const cardAtividade = criarCard("item-ativ", atividade.titulo, [
        detalhes,
      ]);
      listaAtividades.append(cardAtividade);
    }
  }

  seletorTurma.value = turmaSelecionada;

  document.getElementById("qtTurmas").textContent = turmas.length;
  document.getElementById("qtAlunos").textContent = totalAlunos;
  document.getElementById("qtAtividades").textContent = totalAtividades;
}

async function lerResposta(resposta) {
  if (resposta.status === 401) {
    window.location.href = "/index.html";
    throw new Error("Faça login para continuar.");
  }

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || "Não foi possível concluir a operação.");
  }

  return dados;
}

async function criarTurma(e) {
  e.preventDefault();

  const nome = document.getElementById("nometurma").value;
  const disciplina = document.getElementById("materiaturma").value;

  botaoTurma.disabled = true;
  avisoTurma.textContent = "";

  try {
    const resposta = await fetch("/api/professor/turmas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, disciplina }),
    });

    const turma = await lerResposta(resposta);

    turmas.push(turma);
    formTurma.reset();
    atualizarPainel();
    avisoTurma.textContent = "Turma criada!";
  } catch (erro) {
    avisoTurma.textContent = erro.message;
  } finally {
    botaoTurma.disabled = false;
  }
}

async function publicarAtividade(e) {
  e.preventDefault();

  if (seletorTurma.value === "") {
    avisoAtividade.textContent = "Selecione uma turma.";
    return;
  }

  const turmaId = Number(seletorTurma.value);
  const titulo = document.getElementById("tituloativ").value;
  const tipo = document.getElementById("seltipo").value;
  const data = document.getElementById("dataativ").value;

  botaoAtividade.disabled = true;
  avisoAtividade.textContent = "";

  try {
    const resposta = await fetch("/api/atividades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ turmaId, titulo, tipo, data }),
    });

    const atividade = await lerResposta(resposta);

    for (let i = 0; i < turmas.length; i++) {
      const turma = turmas[i];

      if (Number(turma.id) === turmaId) {
        turma.atividades.push(atividade);
        break;
      }
    }

    formAtividade.reset();
    atualizarPainel();
    avisoAtividade.textContent = "Atividade publicada!";
  } catch (erro) {
    avisoAtividade.textContent = erro.message;
  } finally {
    botaoAtividade.disabled = false;
  }
}

async function iniciar() {
  botaoTurma.disabled = true;
  botaoAtividade.disabled = true;

  try {
    const respostaUsuario = await fetch("/api/logado");
    const dados = await lerResposta(respostaUsuario);
    const usuario = dados.usuario;

    if (usuario.perfil !== "professor") {
      window.location.href = "/index.html";
      return;
    }

    nomeUser.textContent = usuario.nome;

    const respostaTurmas = await fetch("/api/professor/turmas");
    turmas = await lerResposta(respostaTurmas);

    atualizarPainel();
    botaoTurma.disabled = false;
    botaoAtividade.disabled = false;
  } catch (erro) {
    avisoTurma.textContent = erro.message;
  }
}

formTurma.addEventListener("submit", criarTurma);
formAtividade.addEventListener("submit", publicarAtividade);

iniciar();
