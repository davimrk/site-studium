
const modal = document.getElementById("modal");
const passo1 = document.getElementById("passo1");
const passo2 = document.getElementById("passo2");
const tagForm = document.getElementById("tagform");
const tituloForm = document.getElementById("tituloform");
const camponome = document.getElementById("camponome");
const campoPerfil = document.getElementById("campo-perfil");
const btnEnviar = document.getElementById("btnenviar");
const msg = document.getElementById("msg");
const form = document.getElementById("formconta");
const butaoProf = document.getElementById("butaoProf");

let modo = "cadastro";


butaoProf.addEventListener("click", (e) => {
    e.preventDefault();
    abrirModal();
} )
function abrirModal() {
    modal.classList.add("ativo");
}

document.getElementById("btnlogin")?.addEventListener("click", () => {
    irPasso2("login");
});
document.getElementById("btncriar").addEventListener("click", (e) => {
    e.preventDefault();
    abrirModal();
});


document.getElementById("btnentrar")?.addEventListener("click", () => {
    abrirModal();
    irPasso2("login");
});

document.querySelectorAll("[fechar], [data-fechar]").forEach((botao) => {
    botao.addEventListener("click", fecharModal);
});

function fecharModal() {
    modal.classList.remove("ativo");
    resetform();
}

modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        fecharModal();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalAdmin.hidden) {
        fecharModal();
    }
});


function resetform() {
    passo1.hidden = false;
    passo2.hidden = true;

    form.reset();
    campoPerfil.value = "";
    msg.textContent = "";
    msg.style.color = "";

    modo = "cadastro";
    btnEnviar.disabled = false;
}
document.querySelectorAll(".opcao").forEach((botao) => {
    botao.addEventListener("click", () => {
        const perfil = botao.dataset.perfil;

        campoPerfil.value = perfil;
        irPasso2("cadastro", perfil);
    });
});
document.getElementById("btnvoltar")?.addEventListener("click", () => {
    passo2.hidden = true;
    passo1.hidden = false;
    msg.textContent = "";
});

function irPasso2(tipo, perfil) {
    modo = tipo;

    passo1.hidden = true;
    passo2.hidden = false;
    msg.textContent = "";

    if (modo === "login") {
        tagForm.textContent = "bem-vindo de volta";
        tituloForm.textContent = "Entrar na conta";

        camponome.hidden = true;
        document.getElementById("nome").required = false;

        btnEnviar.textContent = "Entrar";

    } else {
        tagForm.textContent = "criar conta";

        tituloForm.textContent =
            perfil === "professor" ? "Conta de professor" : "Quase lá";

        camponome.hidden = false;
        document.getElementById("nome").required = true;

        btnEnviar.textContent = "Criar conta";
    }
}

function redirecionar(perfil) {
    if (perfil === "aluno") {
        window.location.href = "/aluno.html";
    } else if (perfil === "professor") {
        window.location.href = "/professor.html";
    }
    else if (perfil === "admin") {
        window.location.href = "/adm.html"
    }
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    if (!email || !senha) {
        msg.textContent = "Preencha todos os campos.";
        msg.style.color = "red";
        return;
    }

    let endereco = "/api/login";
    let dadosEnviar = { email, senha };

    if (modo === "cadastro") {
        const nome = document.getElementById("nome").value.trim();
        const perfil = campoPerfil.value;

        if (!nome || !perfil) {
            msg.textContent = "Preencha todos os campos.";
            msg.style.color = "red";
            return;
        }

        endereco = "/api/cadastro";
        dadosEnviar = { nome, email, senha, perfil };
    }

    btnEnviar.disabled = true;
    msg.textContent = "Aguarde...";
    msg.style.color = "";

    try {
        const resposta = await fetch(endereco, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosEnviar)
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            msg.textContent = dados.mensagem || "Ocorreu um erro.";
            msg.style.color = "red";
            return;
        }

        if (modo === "cadastro") {
            const respostaLogin = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, senha })
            });

            const dadosLogin = await respostaLogin.json();

            if (!respostaLogin.ok) {
                msg.textContent =
                    "Conta criada! Faça login para continuar.";
                msg.style.color = "green";
                irPasso2("login");
                return;
            }

            msg.textContent = "Conta criada com sucesso!";
            msg.style.color = "green";

            redirecionar(dadosLogin.usuario.perfil);
            return;
        }
        msg.textContent = "Login realizado com sucesso!";
        msg.style.color = "green";

        redirecionar(dados.usuario.perfil);

    } catch (erro) {
        console.error(erro);

        msg.textContent = "Erro ao conectar com o servidor.";
        msg.style.color = "red";

    } finally {
        btnEnviar.disabled = false;
    }
});
