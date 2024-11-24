const Genero = require('../models/genero');

// Obter todos os gêneros
exports.getAllGeneros = async (req, res) => {
    try {
        const generos = await Genero.find();
        res.render('generos/list', { generos });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Criar um novo gênero
exports.createGenero = async (req, res) => {
    try {
        const genero = new Genero({
            nome: req.body.nome
        });
        await genero.save();
        res.redirect('/generos');
    } catch (err) {
        res.status(400).send(err.message);
    }
};

// Obter um único gênero pelo ID
exports.getGeneroById = async (req, res) => {
    try {
        const genero = await Genero.findById(req.params.id);
        if (!genero) return res.status(404).send('Gênero não encontrado.');
        res.json(genero);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Atualizar um gênero
exports.updateGenero = async (req, res) => {
    try {
        const genero = await Genero.findByIdAndUpdate(
            req.params.id,
            { nome: req.body.nome },
            { new: true }
        );
        if (!genero) return res.status(404).send('Gênero não encontrado.');
        res.redirect('/generos');
    } catch (err) {
        res.status(400).send(err.message);
    }
};

// Excluir um gênero
exports.deleteGenero = async (req, res) => {
    try {
        const genero = await Genero.findByIdAndDelete(req.params.id);
        if (!genero) return res.status(404).send('Gênero não encontrado.');
        res.redirect('/generos');
    } catch (err) {
        res.status(500).send(err.message);
    }
};