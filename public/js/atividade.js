const partes = window.location.pathname.split("/"); //IA, nao consegui achar nenhuma outra forma que ficasse funcional. Mas basicamente separa a url em partes, por exemplo: /turma/1/atividade/2 vira ["", "turma", "1", "atividade", "2"]
const turma = partes[2];
const id = partes[4];


const mensagem = document.getElementById("mensagem");
const formulario = document.getElementById("form-entrega");

async function lerResposta(resposta) {
  if (resposta.status === 401) {
    window.location.href = "/";
    throw new Error("Faça login para continuar.");
  }

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || "Não foi possível concluir a operação.");
  }

  return dados;
}

function mostrarEntregas(entregas) {
  const lista = document.getElementById("entregas");
  lista.textContent = "";

  if (entregas.length === 0) {
    lista.textContent = "Nenhuma entrega ainda.";
    return;
  }

  for (let i = 0; i < entregas.length; i++) {
    const entrega = entregas[i];

    const card = document.createElement("article");
    const nome = document.createElement("h3");
    const texto = document.createElement("p");
    const formNota = document.createElement("form");
    const label = document.createElement("label");
    const campoNota = document.createElement("input");
    const botao = document.createElement("button");
    const aviso = document.createElement("p");

    nome.textContent = entrega.nome;
    texto.textContent = entrega.resposta;
    texto.className = "texto";
    formNota.className = "formpainel";

    label.textContent = "Nota de 0 a 10 ";
    campoNota.type = "number";
    campoNota.min = "0";
    campoNota.max = "10";
    campoNota.step = "0.01";
    campoNota.required = true;

    if (entrega.nota != null) {
      campoNota.value = entrega.nota;
    }

    botao.type = "submit";
    botao.className = "btn btn1";
    botao.textContent = "Salvar nota";
    aviso.setAttribute("role", "status");

    label.append(campoNota);
    formNota.append(label, botao, aviso);
    card.append(nome, texto, formNota);
    lista.append(card);

    formNota.addEventListener("submit", async function (evento) {
      evento.preventDefault();
      botao.disabled = true;
      aviso.textContent = "";

      try {
        const resposta = await fetch(
          "/api/turmas/" + turma + "/atividades/" + id + "/nota",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              entregaId: entrega.id,
              nota: Number(campoNota.value),
            }),
          },
        );

        const dados = await lerResposta(resposta);
        aviso.textContent = dados.mensagem;
      } catch (erro) {
        aviso.textContent = erro.message;
      } finally {
        botao.disabled = false;
      }
    });
  }
}

async function carregarAtividade() {
  if (partes[1] !== "turma" || partes[3] !== "atividade" || !turma || !id) {
    mensagem.textContent = "Abra ao abrir a atividade. Tente novamente pelo painel do aluno.";
    return;
  }

  const resposta = await fetch("/api/turmas/" + turma + "/atividades/" + id);
  const dados = await lerResposta(resposta);

  document.getElementById("voltar").href = "/turma/" + turma;
  document.getElementById("titulo").textContent = dados.atividade.titulo;
  document.getElementById("detalhes").textContent =
    "Prazo: " + (dados.atividade.prazo || "sem prazo");
  document.getElementById("descricao").textContent =
    dados.atividade.descricao || "Sem enunciado.";

  const areaEntrega = document.getElementById("area-entrega");
  const areaCorrecao = document.getElementById("area-correcao");

  if (dados.professor) {
    areaEntrega.hidden = true;
    areaCorrecao.hidden = false;
    mostrarEntregas(dados.entregas);
  } else {
    areaEntrega.hidden = false;
    areaCorrecao.hidden = true;

    if (dados.entrega) {
      formulario.hidden = true;
      document.getElementById("resposta-enviada").textContent =
        dados.entrega.resposta;

      let nota = "aguardando correção";

      if (dados.entrega.nota != null) {
        nota = dados.entrega.nota;
      }

      document.getElementById("nota").textContent = "Nota: " + nota;
    } else {
      formulario.hidden = false;
    }
  }

  document.getElementById("conteudo").hidden = false;
}

async function entregarAtividade(e) {
  e.preventDefault();

  const botao = formulario.querySelector('button[type="submit"]');
  const texto = document.getElementById("resposta").value;

  botao.disabled = true;
  mensagem.textContent = "";

  try {
    const resposta = await fetch(
      "/api/turmas/" + turma + "/atividades/" + id + "/entrega",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resposta: texto }),
      },
    );

    const dados = await lerResposta(resposta);
    formulario.hidden = true;
    mensagem.textContent = dados.mensagem;
    await carregarAtividade();
  } catch (erro) {
    mensagem.textContent = erro.message;
  } finally {
    botao.disabled = false;
  }
}

formulario.addEventListener("submit", entregarAtividade);

carregarAtividade().catch(function (erro) {
  mensagem.textContent = erro.message;
});
