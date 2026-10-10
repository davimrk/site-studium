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

document.getElementById("formconta").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    msg.innerHTML = "Preencha todos os campos.";
    msg.style.color = "red";
    return;
  }

  if (modo === "cadastro") {
    const nome = document.getElementById("nome").value.trim();
    if (!nome) {
      msg.innerHTML = "Digite seu nome.";
      msg.style.color = "red";
      return;
    }
    const perfil = campoPerfil.value;
    if (perfil === "aluno") {
      msg.innerHTML = "Conta criada com sucesso!";
      msg.style.color = "green";
      setTimeout(function () {
        window.location.href = "aluno.html";
      }, 1000);
    } else if (perfil === "professor") {
      msg.innerHTML = "Conta criada com sucesso!";
      msg.style.color = "green";
      setTimeout(function () {
        window.location.href = "professor.html";
      }, 1000);
    }
  } else {
    msg.innerHTML = "Entrando...";
    msg.style.color = "green";
  }
});
