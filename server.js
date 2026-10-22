const express = require("express");
const mysql = require("mysql2/promise");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "img")));
app.use("/fonts", express.static(path.join(__dirname, "fonts")));
app.use(express.json());
app.use(cookieParser());

const cadastro = modo === "cadastro";
const endereco = cadastro ? "/api/cadastro" : "/api/login";

const dadosEnviar = cadastro
  ? { nome, email, senha, perfil: campoPerfil.value }
  : { email, senha };

const resposta = await fetch(endereco, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(dadosEnviar)
});

const perfil = dados.usuario?.perfil;

if (perfil === "aluno") {
  window.location.href = "/aluno.html";
} else if (perfil === "professor") {
  window.location.href = "/professor.html";
}

app.post("/login", (req, res) => {
    const usuario = {
        id: 1,
        nome: "Yuri",
        perfil: "aluno"
    };

    const token = jwt.sign(
        usuario,
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
    });

    res.json({ mensagem: "Login realizado!" });
});

app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
    });
    res.json({ mensagem: "Logout efetuado!" });
});

app.get("/verificar", (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send("Faça login primeiro!");
    }

    try {
        const usuario = jwt.verify(token, process.env.JWT_SECRET);
        res.json(usuario);
    } catch {
        res.status(401).send("Token inválido!");
    }
});

app.listen(3000);
