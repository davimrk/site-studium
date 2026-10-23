// oi moraninho moranao
form.getElementById('form_ativ').addEventListener('submit_ativ', async (e) => {
    e.preventDefault();

    const tituloativ = form.getElementById('tituloativ').value;
    const dataativ = form.getElementById('dataativ').value;

    app.post('/api/atividades', (req, res) => {
        const { tituloativ, dataativ } = req.body;
        const novaAtividade = { tituloativ, dataativ };
        if (!tituloativ || !dataativ) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios." });
        }
    })
});

// oi maroni :)
// oi coco armadurense

// oi moraninho moranao (versão rodrigo)