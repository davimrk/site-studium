const formulario = document.getElementById("formentrar");
const mensagem = document.getElementById("msgentrar");
const nomeUser = document.getElementById("nomeuser");
const listaTurmas = document.getElementById("minhasTurmas");
const listaAtividades = document.getElementById("minhasAtividades");

async function lerResposta(resposta) {
  if (resposta.status === 401) {
    window.location.href = "/";
    throw new Error("Faça login para continuar.");
  }

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar os dados.");
  }

  return resposta.json();
}

function criarLinha(url, titulo, detalhes) {
  const link = document.createElement("a");
  link.className = "linha-aluno";
  link.href = url;

  const nome = document.createElement("strong");
  nome.textContent = titulo;

  const texto = document.createElement("span");
  texto.textContent = detalhes;

  link.append(nome, texto);
  return link;
}

async function carregarTurmas() {
  try {
    const resposta = await fetch("/api/minhas-turmas");
    const turmas = await lerResposta(resposta);

    listaTurmas.textContent = "";

    if (turmas.length === 0) {
      listaTurmas.textContent = "Você ainda não entrou em uma turma.";
      return;
    }

    for (let i = 0; i < turmas.length; i++) {
      const turma = turmas[i];
      //turma.html?id= eh a msm coisa de "/turma/" + turma.id
      const endereco = "/turma/" + turma.id;
      const link = criarLinha(endereco, turma.nome, turma.disciplina);

      listaTurmas.append(link);
    }
  } catch (erro) {
    listaTurmas.textContent = erro.message;
  }
}

async function carregarAtividades() {
  try {
    const resposta = await fetch("/api/minhas-atividades");
    const atividades = await lerResposta(resposta);

    listaAtividades.textContent = "";

    if (atividades.length === 0) {
      listaAtividades.textContent =
        "Nenhuma atividade publicada nas suas turmas.";
      return;
    }

    for (let i = 0; i < atividades.length; i++) {
      const atividade = atividades[i];
      let tipo = "Atividade";
      let prazo = "Sem prazo";

      if (atividade.tipo === "prova") {
        tipo = "Prova";
      }

      if (atividade.prazo) {
        prazo = "Até " + atividade.prazo;
      }

      const endereco =
        "/turma/"+ atividade.turma_id + "/atividade/"+ atividade.id;
      const detalhes = tipo + " - " + atividade.turma + " - " + prazo;
      const link = criarLinha(endereco, atividade.titulo, detalhes);

      listaAtividades.append(link);
    }
  } catch (erro) {
    listaAtividades.textContent = erro.message;
  }
}

async function carregarAluno() {
  try {
    const resposta = await fetch("/api/logado");
    const dados = await lerResposta(resposta);

    if (dados.usuario.perfil !== "aluno") {
      window.location.href = "/";
      return;
    }

    nomeUser.textContent = ", " + dados.usuario.nome;

    carregarTurmas();
    carregarAtividades();
  } catch (erro) {
    listaTurmas.textContent = erro.message;
    listaAtividades.textContent = erro.message;
  }
}

// testar depois se funciona

async function entrarNaTurma(e) {
  e.preventDefault();

  const codigo = document.getElementById("codigo").value.trim().toUpperCase();

  if (codigo === "") {
    mensagem.textContent = "Digite o código da turma.";
    return;
  }

  try {
    const resposta = await fetch("/api/turmas/entrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: codigo }),
    });

    if (resposta.status === 401) {
      window.location.href = "/";
      return;
    }

    const dados = await resposta.json();

    if (resposta.ok) {
        // dps trocar a rota
      window.location.href = "/turma/" + dados.turma.id;
    } else {
      mensagem.textContent = dados.mensagem;
    }
  } catch (erro) {
    mensagem.textContent = "Erro ao conectar com o servidor.";
    console.log(erro);
  }
}

formulario.addEventListener("submit", entrarNaTurma);
carregarAluno();
