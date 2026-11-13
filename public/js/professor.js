const nomeUser = document.getElementById("nomeuser");
const seletorTurma = document.getElementById("selturma");
const formTurma = document.getElementById("formturma");
const formAtividade = document.getElementById("formativ");
let turmas = [];

function item(classe, titulo, detalhes) {
    const elemento = document.createElement("div");
    elemento.className = classe;
    const nome = document.createElement("strong");
    nome.textContent = titulo;
    elemento.append(nome);
    for (const detalhe of detalhes) {
        const linha = document.createElement("span");
        linha.textContent = detalhe;
        elemento.append(linha);
    }
    return elemento;
}

function atualizarPainel() {
    const selecionada = seletorTurma.value;
    seletorTurma.replaceChildren(new Option("Selecione", ""));
    const listaTurmas = document.getElementById("listaturmas");
    const listaAtividades = document.getElementById("listaAtividades");
    listaTurmas.replaceChildren();
    listaAtividades.replaceChildren();
    let alunos = 0;
    let atividades = 0;

    for (const turma of turmas) {
        alunos += Number(turma.alunos);
        atividades += turma.atividades.length;
        seletorTurma.add(new Option(`${turma.nome} - ${turma.disciplina}`, turma.id));
        listaTurmas.append(item("item-turma", turma.nome, [
            `Código: ${turma.codigo}`,
            `${turma.alunos} alunos • ${turma.atividades.length} atividades`
        ]));
        for (const atividade of turma.atividades) {
            listaAtividades.append(item("item-ativ", atividade.titulo, [
                [turma.nome, atividade.tipo, atividade.data].filter(Boolean).join(" • ")
            ]));
        }
    }

    seletorTurma.value = selecionada;
    document.getElementById("qtTurmas").textContent = turmas.length;
    document.getElementById("qtAlunos").textContent = alunos;
    document.getElementById("qtAtividades").textContent = atividades;
}

async function consultar(url, corpo) {
    const resposta = await fetch(url, corpo && {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo)
    });
    if (resposta.status === 401) window.location.href = "/index.html";
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.mensagem || "Não foi possível concluir a operação.");
    return dados;
}

function enviar(formulario, aviso, acao) {
    formulario.addEventListener("submit", async evento => {
        evento.preventDefault();
        const botao = formulario.querySelector('button[type="submit"]');
        botao.disabled = true;
        aviso.textContent = "";
        try {
            const mensagem = await acao();
            formulario.reset();
            atualizarPainel();
            aviso.textContent = mensagem;
        } catch (erro) {
            aviso.textContent = erro.message;
        } finally {
            botao.disabled = false;
        }
    });
}

enviar(formTurma, document.getElementById("msgturma"), async () => {
    const turma = await consultar("/api/professor/turmas", {
        nome: document.getElementById("nometurma").value,
        disciplina: document.getElementById("materiaturma").value
    });
    turmas.push(turma);
    return "Turma criada!";
});

enviar(formAtividade, document.getElementById("msgativ"), async () => {
    const turmaId = Number(seletorTurma.value);
    const atividade = await consultar("/api/atividades", {
        turmaId,
        titulo: document.getElementById("tituloativ").value,
        tipo: document.getElementById("seltipo").value,
        data: document.getElementById("dataativ").value
    });
    turmas.find(turma => Number(turma.id) === turmaId)?.atividades.push(atividade);
    return "Atividade publicada!";
});

document.getElementById("btnsair").addEventListener("click", async () => {
    try {
        await consultar("/api/auth/logout", {});
        window.location.href = "/index.html";
    } catch (erro) {
        alert(erro.message);
    }
});

async function iniciar() {
    const botoes = [formTurma, formAtividade].map(form => form.querySelector('button[type="submit"]'));
    botoes.forEach(botao => { botao.disabled = true; });
    try {
        const { usuario } = await consultar("/api/logado");
        if (usuario.perfil !== "professor") {
            window.location.href = "/index.html";
            return;
        }
        nomeUser.textContent = usuario.nome;
        turmas = await consultar("/api/professor/turmas");
        atualizarPainel();
        botoes.forEach(botao => { botao.disabled = false; });
    } catch (erro) {
        document.getElementById("msgturma").textContent = erro.message;
    }
}

iniciar();
