const formulario = document.getElementById("formentrar");
const mensagem = document.getElementById("msgentrar");
const nomeUser = document.getElementById("nomeuser");

async function buscar(url) {
    const resposta = await fetch(url);
    if (resposta.status === 401) {
        window.location.href = "/";
        throw new Error("Faça login para continuar.");
    }
    if (!resposta.ok) throw new Error("Não foi possível carregar os dados.");
    return resposta.json();
}

function criarLinha(url, titulo, detalhes) {
    const link = document.createElement("a");
    const nome = document.createElement("strong");
    const texto = document.createElement("span");
    link.className = "linha-aluno";
    link.href = url;
    nome.textContent = titulo;
    texto.textContent = detalhes;
    link.append(nome, texto);
    return link;
}

async function carregarLista(id, url, vazio, criarItem) {
    const lista = document.getElementById(id);
    try {
        const itens = await buscar(url);
        lista.replaceChildren();
        if (!itens.length) lista.textContent = vazio;
        for (const item of itens) lista.append(criarItem(item));
    } catch (erro) {
        lista.textContent = erro.message;
    }
}

async function carregarAluno() {
    let dados;
    try {
        dados = await buscar("/api/logado");
    } catch (erro) {
        document.getElementById("minhasAtividades").textContent = erro.message;
        document.getElementById("minhasTurmas").textContent = erro.message;
        return;
    }

    if (dados.usuario.perfil !== "aluno") {
        window.location.href = "/";
        return;
    }

    nomeUser.textContent = ", " + dados.usuario.nome;
    carregarLista("minhasTurmas", "/api/minhas-turmas", "Você ainda não entrou em uma turma.", turma =>
        criarLinha("/turma.html?id=" + turma.id, turma.nome, turma.disciplina)
    );
    carregarLista("minhasAtividades", "/api/minhas-atividades", "Nenhuma atividade publicada nas suas turmas.", atividade => {
        const url = "/atividade.html?turma=" + atividade.turma_id + "&id=" + atividade.id;
        const tipo = atividade.tipo === "prova" ? "Prova" : "Atividade";
        const prazo = atividade.prazo ? "Até " + atividade.prazo : "Sem prazo";
        return criarLinha(url, atividade.titulo, tipo + " · " + atividade.turma + " · " + prazo);
    });
}

formulario.addEventListener("submit", async function(evento) {
    evento.preventDefault();

    const codigo = document.getElementById("codigo").value.trim().toUpperCase();

    if (codigo === "") {
        mensagem.textContent = "Digite o código da turma.";
        return;
    }

    try {
        const resposta = await fetch("/api/turmas/entrar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ codigo: codigo })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            mensagem.textContent = "Você entrou na turma com sucesso!";
            window.location.href = "/turma.html?id=" + dados.turma.id;
        } else {
            mensagem.textContent = dados.mensagem;
        }

    } catch (erro) {
        mensagem.textContent = "Erro ao conectar com o servidor.";
        console.log(erro);
    }
});

carregarAluno();