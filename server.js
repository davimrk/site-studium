const express = require("express");
const mysql = require("mysql2/promise");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

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
