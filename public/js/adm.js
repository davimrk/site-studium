
const resultado = document.getElementById("resultado");
const titulo = document.getElementById("titulo");
const lista = document.getElementById("lista");
const mensagem = document.getElementById("mensagem");

const botoes = document.querySelectorAll("[data-consulta]");

botoes.forEach(botao => {
    botao.addEventListener("click", async () => {
        const categoria = botao.dataset.consulta;

        for (const opcao of botoes) {
            opcao.disabled = true;
            opcao.setAttribute("aria-pressed", opcao === botao);
        }
        mensagem.textContent = "Consultando…";
        resultado.hidden = true;
        lista.innerHTML = "";

        try {
            const resposta = await fetch(`/api/admin/${categoria}`);

            if (resposta.status === 401) {
                location.href = "/index.html";
                return;
            }

            if (!resposta.ok) {
                throw new Error("Não foi possível consultar os registros.");
            }

            const dados = await resposta.json();

            titulo.textContent = botao.textContent;

            if (dados.length === 0) {
                lista.textContent = "Nenhum registro encontrado.";
            }

            dados.forEach(item => {
                const registro = document.createElement("div");
                registro.className = "registro";

                const nome = document.createElement("strong");
                nome.textContent = item.nome;

                const detalhe = document.createElement("span");

                if (categoria === "turmas") {
                    detalhe.textContent = `Código: ${item.codigo}`;
                } else if (categoria === "disciplinas") {
                    detalhe.textContent = "Turmas: " + item.total_turmas;
                } else if (categoria === "atividades") {
                    const tipo = item.tipo === "prova" ? "Prova" : "Atividade";
                    detalhe.textContent = tipo + " · " + item.turma + " · " + (item.prazo || "Sem prazo");
                } else {
                    detalhe.textContent = item.email;
                }

                registro.append(nome, detalhe);
                lista.appendChild(registro);
            });

            resultado.hidden = false;
            mensagem.textContent = "";

        } catch (erro) {
            mensagem.textContent = erro.message;
        } finally {
            for (const opcao of botoes) opcao.disabled = false;
        }
    });
});


const botoes = document.querySelectorAll("[data-consulta]");
const grafico = document.getElementById("grafico");
const resultado = document.getElementById("resultado");
const imagemGrafico = document.createElement("img");

imagemGrafico.alt = "Gráfico administrativo do Studium";
imagemGrafico.classList.add("imagem-grafico");
grafico.appendChild(imagemGrafico);

botoes.forEach(botao => {
    botao.addEventListener("click", async () => {
        const tipo = botao.dataset.consulta;

        botoes.forEach(item => {
            item.setAttribute("aria-pressed", "false");
        });

        botao.setAttribute("aria-pressed", "true");

        grafico.hidden = false;
        resultado.hidden = true;

        grafico.innerHTML = "<p>Carregando gráfico...</p>";

        try {
            const resposta = await fetch(
                `http://127.0.0.1:5001/api/grafico/${tipo}`
            );

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar o gráfico.");
            }

            const imagem = await resposta.blob();
            const urlImagem = URL.createObjectURL(imagem);

            grafico.innerHTML = "";
            imagemGrafico.src = urlImagem;
            grafico.appendChild(imagemGrafico);

        } catch (erro) {
            grafico.innerHTML = `
                <p>Erro ao carregar o gráfico.</p>
                <p>${erro.message}</p>
            `;

            console.error(erro);
        }
    });
});


botoes[0].click();
