const id = new URLSearchParams(location.search).get("id");
const mensagem = document.getElementById("mensagem");
const formulario = document.getElementById("form-publicar");

function mostrarLista(nome, itens, mostrarItem) {
    const lista = document.getElementById(nome);
    lista.replaceChildren();
    if (itens.length === 0) lista.textContent = "Nenhum item por enquanto.";
    for (const item of itens) {
        const linha = document.createElement("article");
        mostrarItem(linha, item);
        lista.append(linha);
    }
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
    if (!resposta.ok) throw new Error(dados.mensagem);

    document.getElementById("titulo").textContent = dados.turma.nome;
    document.getElementById("detalhes").textContent = dados.turma.disciplina + " · Código " + dados.turma.codigo;
    document.getElementById("lista-alunos").hidden = !dados.professor;
    document.getElementById("publicar").hidden = !dados.professor;
    document.getElementById("conteudo").hidden = false;

    mostrarLista("atividades", dados.atividades, (linha, atividade) => {
        const link = document.createElement("a");
        link.href = "/atividade.html?turma=" + dados.turma.id + "&id=" + atividade.id;
        link.textContent = atividade.titulo + " · " + atividade.tipo;
        linha.append(link);
    });
    mostrarLista("materiais", dados.materiais, (linha, material) => {
        linha.textContent = material.titulo + " — " + material.descricao;
        if (/^https?:\/\//i.test(material.arquivo || "")) {
            const link = document.createElement("a");
            link.href = material.arquivo;
            link.textContent = "Abrir material";
            linha.append(document.createElement("br"), link);
        }
    });
    mostrarLista("avisos", dados.avisos, (linha, aviso) => {
        linha.textContent = aviso.titulo + " — " + aviso.mensagem;
    });
    mostrarLista("alunos", dados.alunos, (linha, aluno) => {
        linha.textContent = aluno.nome;
    });
}

function mostrarCampos() {
    const tipo = formulario.elements.tipo.value;
    document.getElementById("campo-prazo").hidden = tipo === "material" || tipo === "aviso";
    document.getElementById("campo-arquivo").hidden = tipo !== "material";
}
formulario.elements.tipo.addEventListener("change", mostrarCampos);

formulario.addEventListener("submit", async evento => {
    evento.preventDefault();
    const botao = formulario.querySelector("button");
    botao.disabled = true;
    try {
        const campos = new FormData(formulario);
        const tipo = campos.get("tipo");
        const titulo = campos.get("titulo");
        const texto = campos.get("texto");
        let rota = "/api/atividades";
        let dados = { turmaId: Number(id), tipo, titulo, descricao: texto, data: campos.get("data") };
        if (tipo === "material" || tipo === "aviso") {
            rota = "/api/turmas/" + encodeURIComponent(id) + "/publicacoes";
            dados = { tipo, titulo, texto, arquivo: campos.get("arquivo").trim() };
        }
        const resposta = await fetch(rota, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
        const resultado = await resposta.json();
        if (!resposta.ok) throw new Error(resultado.mensagem);
        formulario.reset();
        mostrarCampos();
        await carregarTurma();
        mensagem.textContent = "Publicado na turma.";
    } catch (erro) {
        mensagem.textContent = erro.message;
    } finally {
        botao.disabled = false;
    }
});

carregarTurma().catch(erro => { mensagem.textContent = erro.message; });
