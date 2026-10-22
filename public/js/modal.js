const modal = document.getElementById("modal");
const passo1 = document.getElementById("passo1");
const passo2 = document.getElementById("passo2");
const tagForm = document.getElementById("tagform");
const tituloForm = document.getElementById("tituloform");
const camponome = document.getElementById("camponome");
const campoPerfil = document.getElementById("campo-perfil");
const btnEnviar = document.getElementById("btnenviar");
const msg = document.getElementById("msg");

let modo = "cadastro";

function abrirModal() {
  modal.classList.add("ativo");
}
document.getElementById("btncriar")?.addEventListener("click", abrirModal);
document.getElementById("btnentrar")?.addEventListener("click", abrirModal);
document.getElementById("btncomece")?.addEventListener("click", abrirModal);

document.querySelectorAll("[fechar], [data-fechar]").forEach((butao) => {
  butao.addEventListener("click", fecharModal);
});

function fecharModal() {
  modal.classList.remove("ativo");
  resetform();
}

function mostrarMensagem(texto, sucesso) {
    msg.textContent = texto;
    if (sucesso) {
        msg.style.color = "green";
    } else {
        msg.style.color = "red";
    }
}

function resetform() {
  passo1.hidden = false;
  passo2.hidden = true;
  msg.innerHTML = "";
  document.getElementById("formconta").reset();
}
document.querySelectorAll(".opcao").forEach((butao) => {
  butao.addEventListener("click", () => {
    const perfil = butao.dataset.perfil;
    campoPerfil.value = perfil;
    irPasso2("cadastro", perfil);
  });
});

document.getElementById("btnentrar").addEventListener("click", () => {
  irPasso2("login");
});
document.getElementById("btnvoltar").addEventListener("click", () => {
  passo2.hidden = true;
  passo1.hidden = false;
  msg.innerHTML = "";
});

function irPasso2(tipo, perfil) {
  modo = tipo;
  passo1.hidden = true;
  passo2.hidden = false;
  msg.innerHTML = "";

  if (modo === "login") {
    tagForm.innerHTML = "bem-vindo de volta";
    tituloForm.innerHTML = "Entrar na conta";
    camponome.hidden = true;
    document.getElementById("nome").required = false;
    btnEnviar.innerHTML = "Entrar";
  } else {
    tagForm.innerHTML = "criar conta";
    tituloForm.innerHTML =
      perfil === "professor" ? "Conta de professor" : "Quase lá";
    camponome.hidden = false;
    document.getElementById("nome").required = true;
    btnEnviar.innerHTML = "Criar conta";
  }
}


document.getElementById("formconta").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    if (!email || !senha) {
        mostrarMensagem("Preencha todos os campos.", false);
        return;
    }

    let endereco;
    let dadosEnviar;

    if (modo === "cadastro") {
        if (!nome) {
            mostrarMensagem("Digite seu nome.", false);
            return;
        }

        if (!campoPerfil.value) {
            mostrarMensagem("Selecione um perfil.", false);
            return;
        }

        endereco = "/api/cadastro";

        dadosEnviar = {
            nome: nome,
            email: email,
            senha: senha,
            perfil: campoPerfil.value
        };

    } else {
        endereco = "/api/login";

        dadosEnviar = {
            email: email,
            senha: senha
        };
    }

    btnEnviar.disabled = true;

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
    mostrarMensagem("Erro ao realizar login ou cadastro.", false);
    return;
}

mostrarMensagem("Operação realizada com sucesso!", true);

if (dados.usuario) {
    if (dados.usuario.perfil === "aluno") {
        window.location.href = "/aluno.html";
    } else if (dados.usuario.perfil === "professor") {
        window.location.href = "/professor.html";
    } else {
        mostrarMensagem("Perfil não reconhecido.", false);
    }
}

    } catch (erro) {
        mostrarMensagem("Erro ao conectar com o servidor.", false);
    } finally {
        btnEnviar.disabled = false;
    }
});



document.getElementById("formconta").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    if (!email || !senha) {
        mostrarMensagem("Preencha todos os campos.", false);
        return;
    }

    if (modo === "cadastro") {
        const nome = document.getElementById("nome").value.trim();

        if (!nome) {
            mostrarMensagem("Digite seu nome.", false);
            return;
        }

        mostrarMensagem("Cadastro ainda não disponível.", false);
        return;
    }

    try {
        const resposta = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            mostrarMensagem(dados.mensagem, true);
        } else {
            mostrarMensagem(dados.mensagem || "Erro no login.", false);
        }

    } catch (erro) {
        mostrarMensagem("Erro ao conectar com o servidor.", false);
    }
});
