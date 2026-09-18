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

document.querySelectorAll("[data-fechar]").forEach(el => {
  el.addEventListener("click", fecharModal);
});

function fecharModal() {
  modal.classList.remove("ativo");
  resetarModal();
}

function resetarModal() {
  passo1.hidden = false;
  passo2.hidden = true;
  msg.textContent = "";
  document.getElementById("formconta").reset();
}
document.querySelectorAll(".opcao").forEach(btn => {
  btn.addEventListener("click", () => {
    const perfil = btn.dataset.perfil;
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
    tituloForm.textContent = perfil === "professor" ? "Conta de professor" : "Quase lá";
    camponome.hidden = false;
    document.getElementById("nome").required = true;
    btnEnviar.textContent = "Criar conta";
  }
}

document.getElementById("formconta").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    msg.textContent = "Preencha todos os campos.";
    msg.style.color = "red";
    return;
  }

  if (modo === "cadastro") {
    const nome = document.getElementById("nome").value.trim();
    if (!nome) {
      msg.textContent = "Digite seu nome.";
      msg.style.color = "red";
      return;
    }
    msg.textContent = "Conta criada com sucesso!";
    msg.style.color = "green";
  } else {
    msg.textContent = "Entrando...";
    msg.style.color = "green";
  }
});