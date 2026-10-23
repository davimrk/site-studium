const modalAdmin = document.getElementById("modalAdmin");
const abrirAdmin = document.getElementById("entrarAdmin");
const fecharAdmin = document.getElementById("fecharAdmin");

const formAdmin = document.getElementById("formAdmin");
const emailAdmin = document.getElementById("emailAdmin");
const senhaAdmin = document.getElementById("senhaAdmin");
const mensagemAdmin = document.getElementById("mensagemAdmin");

const btnLoginAdmin = document.getElementById("btnLoginAdmin");
const mostrarSenhaAdmin = document.getElementById("mostrarSenhaAdmin");

abrirAdmin.addEventListener("click", (e) => {
    e.preventDefault();
    modalAdmin.hidden = false;
    emailAdmin.focus();
});

function fecharModalAdmin() {
    modalAdmin.hidden = true;
    formAdmin.reset();
    mensagemAdmin.textContent = "";
}

fecharAdmin.addEventListener("click", fecharModalAdmin);

modalAdmin.addEventListener("click", (e) => {
    if (e.target === modalAdmin) {
        fecharModalAdmin();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalAdmin.hidden) {
        fecharModalAdmin();
    }
});

formAdmin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailAdmin.value.trim();
    const senha = senhaAdmin.value;

    mensagemAdmin.textContent = "Verificando credenciais...";
    mensagemAdmin.style.color = "#64748b";
    btnLoginAdmin.disabled = true;

    try {
        const resposta = await fetch("/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mensagemAdmin.textContent =
                dados.mensagem || "Não foi possível entrar.";
            mensagemAdmin.style.color = "red";
            return;
        }

        if (dados.usuario.perfil !== "admin") {
    mensagemAdmin.textContent = "Acesso não autorizado.";
    mensagemAdmin.style.color = "red";
    return;
}

        mensagemAdmin.textContent = "Acesso autorizado!";
        mensagemAdmin.style.color = "green";

        window.location.href = "/adm.html";

    } catch (erro) {
        console.error(erro);

        mensagemAdmin.textContent =
            "Erro ao conectar com o servidor.";
        mensagemAdmin.style.color = "red";

    } finally {
        btnLoginAdmin.disabled = false;
    }
});
