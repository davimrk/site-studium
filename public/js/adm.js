
const resultado = document.getElementById("resultado");
const titulo = document.getElementById("titulo");
const lista = document.getElementById("lista");
const mensagem = document.getElementById("mensagem");

document.querySelectorAll("[data-consulta]").forEach(botao => {
    botao.addEventListener("click", async () => {
        const categoria = botao.dataset.consulta;

        mensagem.textContent = "Consultando...";
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

            titulo.textContent =
                categoria.charAt(0).toUpperCase() + categoria.slice(1);

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
        }
    });
});
