const parametros = new URLSearchParams(location.search);
const turma = parametros.get("turma");
const id = parametros.get("id");
const rota = "/api/turmas/" + encodeURIComponent(turma) + "/atividades/" + encodeURIComponent(id);
const mensagem = document.getElementById("mensagem");
const formulario = document.getElementById("form-entrega");

async function enviar(caminho, dados) {
    const resposta = await fetch(rota + caminho, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.mensagem);
    return resultado;
}

function mostrarEntregas(entregas) {
    const lista = document.getElementById("entregas");
    lista.replaceChildren();
    if (entregas.length === 0) lista.textContent = "Nenhuma entrega ainda.";

    for (const entrega of entregas) {
        const card = document.createElement("article");
        const nome = document.createElement("h3");
        const texto = document.createElement("p");
        const form = document.createElement("form");
        const label = document.createElement("label");
        const nota = document.createElement("input");
        const botao = document.createElement("button");
        const aviso = document.createElement("p");
        nome.textContent = entrega.nome;
        texto.textContent = entrega.resposta;
        texto.className = "texto";
        form.className = "formpainel";
        label.textContent = "Nota de 0 a 10 ";
        nota.type = "number";
        nota.min = 0;
        nota.max = 10;
        nota.step = "0.01";
        nota.required = true;
        nota.value = entrega.nota ?? "";
        botao.className = "btn btn1";
        botao.textContent = "Salvar nota";
        aviso.setAttribute("role", "status");
        label.append(nota);
        form.append(label, botao, aviso);
        card.append(nome, texto, form);
        lista.append(card);

        form.addEventListener("submit", async evento => {
            evento.preventDefault();
            botao.disabled = true;
            try {
                const dados = await enviar("/nota", { entregaId: entrega.id, nota: Number(nota.value) });
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
    if (!turma || !id) {
        mensagem.textContent = "Abra uma atividade pelo seu painel.";
        return;
    }
    const resposta = await fetch(rota);
    if (resposta.status === 401) {
        location.href = "/";
        return;
    }
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.mensagem);

    document.getElementById("voltar").href = "/turma.html?id=" + encodeURIComponent(turma);
    document.getElementById("titulo").textContent = dados.atividade.titulo;
    document.getElementById("detalhes").textContent = "Prazo: " + (dados.atividade.prazo || "sem prazo");
    document.getElementById("descricao").textContent = dados.atividade.descricao || "Sem enunciado.";
    document.getElementById("area-entrega").hidden = dados.professor;
    document.getElementById("area-correcao").hidden = !dados.professor;
    document.getElementById("conteudo").hidden = false;

    if (dados.professor) {
        mostrarEntregas(dados.entregas);
    } else {
        formulario.hidden = Boolean(dados.entrega);
        if (dados.entrega) {
            document.getElementById("resposta-enviada").textContent = dados.entrega.resposta;
            document.getElementById("nota").textContent = "Nota: " + (dados.entrega.nota ?? "aguardando correção");
        }
    }
}

formulario.addEventListener("submit", async evento => {
    evento.preventDefault();
    const botao = formulario.querySelector("button");
    botao.disabled = true;
    try {
        const dados = await enviar("/entrega", { resposta: document.getElementById("resposta").value });
        formulario.hidden = true;
        await carregarAtividade();
        mensagem.textContent = dados.mensagem;
    } catch (erro) {
        mensagem.textContent = erro.message;
    } finally {
        botao.disabled = false;
    }
});

carregarAtividade().catch(erro => { mensagem.textContent = erro.message; });
