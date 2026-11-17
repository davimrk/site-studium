const id = new URLSearchParams(location.search).get("id");
const mensagem = document.getElementById("mensagem");
const formulario = document.getElementById("form-publicar");
const campoTipo = document.getElementById("tipo-publicacao");

function prepararLista(idLista, itens) {
  const lista = document.getElementById(idLista);
  lista.textContent = "";

  if (itens.length === 0) {
    lista.textContent = "Nenhum item por enquanto.";
  }

  return lista;
}

async function carregarTurma() {
  if (!id) {
    mensagem.textContent = "Abra uma turma pelo seu painel.";
    return;
  }

  const resposta = await fetch("/api/turmas/" + encodeURIComponent(id));

  if (resposta.status === 401) {
    location.href = "/";
    return;
  }

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || "Não foi possível carregar a turma.");
  }

  const titulo = document.getElementById("titulo");
  const detalhes = document.getElementById("detalhes");
  const areaAlunos = document.getElementById("lista-alunos");
  const areaPublicar = document.getElementById("publicar");

  titulo.textContent = dados.turma.nome;
  detalhes.textContent =
    dados.turma.disciplina + " - Código: " + dados.turma.codigo;

  if (dados.professor) {
    areaAlunos.hidden = false;
    areaPublicar.hidden = false;
  } else {
    areaAlunos.hidden = true;
    areaPublicar.hidden = true;
  }

  const listaAtividades = prepararLista("atividades", dados.atividades);

  for (let i = 0; i < dados.atividades.length; i++) {
    const atividade = dados.atividades[i];
    const linha = document.createElement("article");
    const link = document.createElement("a");

    link.href =
      "/atividade.html?turma=" + dados.turma.id + "&id=" + atividade.id;
    link.textContent = atividade.titulo + " - " + atividade.tipo;

    linha.append(link);
    listaAtividades.append(linha);
  }

  const listaMateriais = prepararLista("materiais", dados.materiais);

  for (let i = 0; i < dados.materiais.length; i++) {
    const material = dados.materiais[i];
    const linha = document.createElement("article");

    linha.textContent = material.titulo;

    if (material.descricao) {
      linha.textContent += " - " + material.descricao;
    }

    const arquivo = material.arquivo || "";
    const endereco = arquivo.toLowerCase();

    if (endereco.startsWith("http://") || endereco.startsWith("https://")) {
      const link = document.createElement("a");
      link.href = arquivo;
      link.textContent = "Abrir material";
      linha.append(document.createElement("br"), link);
    }

    listaMateriais.append(linha);
  }

  const listaAvisos = prepararLista("avisos", dados.avisos);

  for (let i = 0; i < dados.avisos.length; i++) {
    const aviso = dados.avisos[i];
    const linha = document.createElement("article");

    linha.textContent = aviso.titulo + ": " + aviso.mensagem;
    listaAvisos.append(linha);
  }

  const listaAlunos = prepararLista("alunos", dados.alunos);

  for (let i = 0; i < dados.alunos.length; i++) {
    const aluno = dados.alunos[i];
    const linha = document.createElement("article");

    linha.textContent = aluno.nome;
    listaAlunos.append(linha);
  }

  document.getElementById("conteudo").hidden = false;
}

function mostrarCampos() {
  const tipo = campoTipo.value;
  const prazo = document.getElementById("campo-prazo");
  const arquivo = document.getElementById("campo-arquivo");

  if (tipo === "material" || tipo === "aviso") {
    prazo.hidden = true;
  } else {
    prazo.hidden = false;
  }

  if (tipo === "material") {
    arquivo.hidden = false;
  } else {
    arquivo.hidden = true;
  }
}

async function publicar(evento) {
  evento.preventDefault();

  const botao = formulario.querySelector('button[type="submit"]');
  const tipo = campoTipo.value;
  const titulo = document.getElementById("titulo-publicacao").value;
  const texto = document.getElementById("texto-publicacao").value;

  botao.disabled = true;
  mensagem.textContent = "";

  try {
    let resposta;

    if (tipo === "material" || tipo === "aviso") {
      let arquivo = "";

      if (tipo === "material") {
        arquivo = document.getElementById("arquivo-publicacao").value.trim();
      }

      resposta = await fetch(
        "/api/turmas/" + encodeURIComponent(id) + "/publicacoes",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo, titulo, texto, arquivo }),
        },
      );
    } else {
      const data = document.getElementById("data-publicacao").value;

      resposta = await fetch("/api/atividades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turmaId: Number(id),
          tipo,
          titulo,
          descricao: texto,
          data,
        }),
      });
    }

    if (resposta.status === 401) {
      location.href = "/";
      return;
    }

    const resultado = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent = resultado.mensagem || "Não foi possível publicar.";
      return;
    }

    formulario.reset();
    mostrarCampos();
    await carregarTurma();
    mensagem.textContent = "Publicado na turma.";
  } catch (erro) {
    mensagem.textContent = erro.message;
  } finally {
    botao.disabled = false;
  }
}

campoTipo.addEventListener("change", mostrarCampos);
formulario.addEventListener("submit", publicar);

mostrarCampos();

carregarTurma().catch(function (erro) {
  mensagem.textContent = erro.message;
});
