const botaoSair = document.getElementById("btnsair");

botaoSair.addEventListener("click", async () => {
    botaoSair.disabled = true;

    try {
        const resposta = await fetch("/api/auth/logout", { method: "POST" });
        if (!resposta.ok) throw new Error("Não foi possível sair. Tente novamente.");
        window.location.replace("/");
    } catch (erro) {
        alert("Não foi possível sair. Tente novamente.");
        botaoSair.disabled = false;
    }
});
