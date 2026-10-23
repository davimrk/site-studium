const formulario = document.getElementById("formentrar");
const mensagem = document.getElementById("msgentrar");
const nomeUser = document.getElementById("nomeuser");
const btnSair = document.getElementById("btnsair")

async function carregarAluno() {
    try {
        const resposta = await fetch("/api/logado");

        if (!resposta.ok) {
            window.location.href = "/index.html";
            return;
        }
        const dados = await resposta.json();
        nomeUser.textContent = dados.usuario.nome;
    } catch (erro) {
        console.log(erro);
        window.location.href = "/index.html";
    }
}


async function carregarTurmas() {
    try {
        const resposta = await fetch("/api/minhas-turmas");

        if (!resposta.ok) {
            console.log("Erro ao buscar turmas");
            return;
        }

        const turmas = await resposta.json();
        const lista = document.getElementById("minhasTurmas");

        lista.innerHTML = "";

        turmas.forEach(function(turma) {
            const card = document.createElement("div");
            const nome = document.createElement("h3");
            const disciplina = document.createElement("p");

            nome.textContent = turma.nome;
            disciplina.textContent = turma.disciplina;

            card.appendChild(nome);
            card.appendChild(disciplina);
            lista.appendChild(card);
        });

    } catch (erro) {
        console.log(erro);
    }
}

async function carregarAtividades() {
    try {
        const resposta = await fetch("/api/minhas-atividades");

        if (!resposta.ok) {
            console.log("Erro ao buscar atividades");
            return;
        }

        const atividades = await resposta.json();
        const lista = document.getElementById("minhasAtividades");

        lista.innerHTML = "";

        atividades.forEach(function(atividade) {
            const card = document.createElement("div");
            const titulo = document.createElement("h3");
            const turma = document.createElement("p");
            const tipo = document.createElement("p");

            titulo.textContent = atividade.titulo;
            turma.textContent = atividade.turma;
            tipo.textContent = atividade.tipo;

            card.appendChild(titulo);
            card.appendChild(turma);
            card.appendChild(tipo);

            lista.appendChild(card);
        });

    } catch (erro) {
        console.log(erro);
    }
}

carregarTurmas();
carregarAtividades();


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
            formulario.reset();
        } else {
            mensagem.textContent = dados.mensagem;
        }

    } catch (erro) {
        mensagem.textContent = "Erro ao conectar com o servidor.";
        console.log(erro);
    }
});

carregarAluno();