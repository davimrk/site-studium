
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");

const mysql = require("mysql2/promise");
require("dotenv").config();

const {
    cadastrarUsuario,
    buscarUsuarioEmail,
    buscarUsuarioId,
    matricularAluno,
    verificarMatricula,
    buscarTurmaCodigo,
    buscarTurmasAluno,
    buscarAtividadesAluno,
    listarAlunos,
    listarProfessores,
    listarTurmas
} = require("./db.js");

//oi yuri

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "img")));
app.use("/fonts", express.static(path.join(__dirname, "fonts")));
 
const opcoesCookies = {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
};
 
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("Configure uma chave JWT com pelo menos 32 caracteres");
}

async function verificarToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            mensagem: "Você precisa fazer login!"
        });
    }

    try {
        const dados = jwt.verify(token, process.env.JWT_SECRET);

        const usuario = await buscarUsuarioId(dados.id);

        if (!usuario) {
            return res.status(401).json({
                mensagem: "Usuário não encontrado!"
            });
        }

        req.usuario = usuario;

        next();

    } catch (erro) {
        return res.status(401).json({
            mensagem: "Sessão inválida ou expirada!"
        });
    }
}

function somenteAdmin(req, res, next) {
    if (req.usuario.perfil !== "admin") {
        return res.status(403).json({
            mensagem: "Acesso permitido apenas para administradores!"
        });
    }

    next();
}
 
app.post("/api/cadastro", async (req, res) => {
    try {
        const { nome, email, senha, perfil } = req.body;
 
        if (!nome || !email || !senha || !perfil) {
            return res.status(400).json({
                mensagem: "Todos os campos são obrigatórios"
            });
        }
 
        if (perfil !== "aluno" && perfil !== "professor") {
            return res.status(400).json({
                mensagem: "Perfil inválido"
            });
        }
 
        const usuarioExiste = await buscarUsuarioEmail(email);
 
        if (usuarioExiste) {
            return res.status(400).json({
                mensagem: "Email já cadastrado"
            });
        }
 
        const senhaHash = await bcrypt.hash(senha, 10);
        const id = await cadastrarUsuario(nome, email, senhaHash, perfil);
 
        res.status(201).json({
            mensagem: "Cadastro realizado com sucesso!",
                usuario: {
                    id: id,
                    nome: nome,
                    email: email,
                    perfil: perfil
                    }
        });
 
    } catch (erro) {
        console.log(erro);
 
        res.status(500).json({
            mensagem: "Erro ao cadastrar usuário"
        });
    }
});

//rota de login
 
app.post("/api/login", async (req, res) => {
    try {
        const { email, senha } = req.body; 
        if (!email || !senha) {
            return res.status(400).json({
                erro: "Email e senha são obrigatórios"
            });
        }
        const usuario = await buscarUsuarioEmail(email);
 
        if (!usuario) {
            return res.status(401).json({
                mensagem: "Email ou senha incorretos"
            });
        }
 
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
 
        if (!senhaCorreta) {
            return res.status(401).json({
                mensagem: "Email ou senha incorretos"
            });
        }
 
        const token = jwt.sign(
            { id: usuario.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRA_EM }
        );
 
        res.cookie("token", token, {
            ...opcoesCookies,
            maxAge: 60 * 60 * 1000
        });
 
        res.json({
            mensagem: "Login realizado com sucesso!",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            }
        });
 
    } catch (erro) {
        console.log(erro);
 
        res.status(500).json({
            mensagem: "Erro ao realizar login"
        });
    }
});
//fim da rota de login
 
app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token", opcoesCookies);
 
    res.json({
        mensagem: "Logout efetuado!"
    });
});
 
app.get("/api/logado", async (req, res) => {
    const token = req.cookies.token;
 
    if (!token) {
        return res.status(401).json({
            mensagem: "Faça login primeiro!"
        });
    }
 
    try {
        const dados = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await buscarUsuarioId(dados.id);
 
        if (!usuario) {
            return res.status(401).json({
                mensagem: "Usuário não encontrado"
            });
        }
 
        res.json({
            usuario: usuario
        });
 
    } catch (erro) {
        res.status(401).json({
            mensagem: "Sessão inválida ou expirada"
        });
    }
});

//código da sala

app.post("/api/turmas/entrar", async (req, res) => {
    try {
        const token = req.cookies.token;
        if(!token) {
            return res.status(401).json({
                mensagem: "Faça login primeiro!"
            })
        }

        let dados;
       try {
        dados = jwt.verify(token, process.env.JWT_SECRET);
        } catch (erro) {
            console.log("Erro ao verificar JWT:", erro.message);
            return res.status(401).json({
            mensagem: "Sessão inválida ou expirada."
    });
}
        const usuario = await buscarUsuarioId(dados.id);
        if (!usuario) {
            return res.status(401).json({
                mensagem: "Usuário não encontrado!"
            })
        }
        if (usuario.perfil !== "aluno") {
            return res.status(403).json({
                mensagem: "Somente alunos podem acessar este local."
            })
        }

       const codigo = String(req.body.codigo || "").trim().toUpperCase();
       if(!codigo){
        return res.status(400).json({
            mensagem: "Digite o código da turma."
        })
       }
       //criar função buscarTurmaCodigo
       const turma = await buscarTurmaCodigo(codigo);
       if(!turma) {
        return res.status(400).json({
            mensagem: "Turma não encontrada."
        })
       }

       const matricula = await verificarMatricula(turma.id, usuario.id);
       if(matricula) {
        return res.status(409).json({
            mensagem: "Você já está matriculado nesta turma!"
        })
       }

       await matricularAluno(turma.id, usuario.id);
       res.status(201).json({
        mensagem: "Você entrou na turma com sucesso!",
            turma: {
                id: turma.id,
                nome: turma.nome
            }
       })
    } catch(erro) {
        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensagem: "Você já está matriculado nessa turma."
            });
        }

        console.log(erro);

        res.status(500).json({
            mensagem: "Erro ao entrar na turma."
        });
    }
});

//criante de atividades
app.post("/api/atividades", async (req, res) => {
    try {
        const { tituloativ, dataativ } = req.body; 
        if (!tituloativ || !dataativ) {
            return res.status(400).json({
                erro: "Todos os campos são obrigatórios."
            });
        }
        const sql = "INSERT INTO atividades (titulo, descricao) VALUES (?, ?)";
        const atividades = await consultarBanco(sql, [titulo, descricao]);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao criar atividade." });
}
});


app.get("/api/minhas-turmas", async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                mensagem: "Faça login primeiro."
            });
        }

        const dados = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await buscarUsuarioId(dados.id);

        if (!usuario || usuario.perfil !== "aluno") {
            return res.status(403).json({
                mensagem: "Acesso não permitido."
            });
        }

        const turmas = await buscarTurmasAluno(usuario.id);

        res.json(turmas);

    } catch (erro) {
        console.log(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar turmas."
        });
    }
});

app.get("/api/minhas-atividades", async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                mensagem: "Faça login primeiro."
            });
        }

        const dados = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await buscarUsuarioId(dados.id);

        if (!usuario || usuario.perfil !== "aluno") {
            return res.status(403).json({
                mensagem: "Acesso não permitido."
            });
        }
        const atividades = await buscarAtividadesAluno(usuario.id);
        res.json(atividades);

    } catch (erro) {
        console.log(erro);
        res.status(500).json({
            mensagem: "Erro ao buscar atividades."
        });
    }
});


//yuri nn ta completo mas ta fechado coisa ae (ou talvez esteja completo)


// login do painel adm
app.post("/api/admin/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: "Preencha email e senha"
            });
        }

        const usuario = await buscarUsuarioEmail(email);

        if (!usuario) {
            return res.status(401).json({
                mensagem: "Email ou senha incorretos"
            });
        }

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaCorreta || Number(usuario.admin) !== 1) {
            return res.status(403).json({
                mensagem: "Acesso administrativo não autorizado"
            });
        }

        const token = jwt.sign(
            { id: usuario.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRA_EM }
        );

        res.cookie("token", token, {
            ...opcoesCookies,
            maxAge: 60 * 60 * 1000
        });

        res.json({
            mensagem: "Login administrativo realizado!",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil,
                admin: true
            }
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao realizar login"
        });
    }
});

app.get("/api/admin/turmas", verificarToken, somenteAdmin, async (req, res) => {
    try {
        res.json(await listarTurmas());
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao consultar turmas" });
    }
});

app.get("/api/admin/professores", verificarToken, somenteAdmin, async (req, res) => {
    try {
        res.json(await listarProfessores());
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao consultar professores" });
    }
});

app.get("/api/admin/alunos", verificarToken, somenteAdmin, async (req, res) => {
    try {
        const alunos = await listarAlunos();
        res.json(alunos)
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao consultar alunos" });
    }
});

app.get("/adm.html", verificarToken, somenteAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "privado", "adm.html"));
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});
