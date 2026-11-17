import os
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import mysql.connector
from io import BytesIO
from flask import Flask, send_file, jsonify, request
from dotenv import load_dotenv
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle
)

app = Flask(__name__)

@app.route("/api/grafico/<tipo>", methods=["POST"])
def gerar_grafico(tipo):

    dados = request.get_json()

    if not isinstance(dados, list):
        return jsonify({"erro": "Dados inválidos"}), 400

    fig, ax = plt.subplots(figsize=(9, 5))

    if tipo == "turmas":
        ax.bar(["Turmas"], [len(dados)])
        ax.set_title("Total de turmas")

    elif tipo == "professores":
        ax.bar(["Professores"], [len(dados)])
        ax.set_title("Total de professores")

    elif tipo == "alunos":
        ax.bar(["Alunos"], [len(dados)])
        ax.set_title("Total de alunos")

    elif tipo == "disciplinas":

        nomes = [item["nome"] for item in dados]
        valores = [int(item["total_turmas"]) for item in dados]

        ax.bar(nomes, valores)
        ax.set_title("Turmas por disciplina")

    elif tipo == "atividades":

        quantidades = Counter(item["tipo"] for item in dados)

        if quantidades:
            ax.pie(
                quantidades.values(),
                labels=quantidades.keys(),
                autopct="%1.1f%%"
            )

        ax.set_title("Atividades e provas")

    else:
        plt.close(fig)
        return jsonify({"erro": "Gráfico não encontrado"}), 404

    ax.set_ylabel("Quantidade")
    fig.tight_layout()

    imagem = BytesIO()
    fig.savefig(imagem, format="png")
    imagem.seek(0)

    plt.close(fig)

    return send_file(imagem, mimetype="image/png")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001)
