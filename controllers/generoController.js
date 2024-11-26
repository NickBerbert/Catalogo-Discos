const Genero = require('../models/genero');

const DiscoModel = require('../models/disco');

exports.getAllGeneros = async (req, res) => {
    try {
        // Busca todos os gêneros únicos a partir dos discos
        const discos = await DiscoModel.find().populate('generos');
        const generosMap = new Map();

        discos.forEach(disco => {
            disco.generos.forEach(genero => {
                if (!generosMap.has(genero._id.toString())) {
                    generosMap.set(genero._id.toString(), genero);
                }
            });
        });

        const generos = Array.from(generosMap.values());

        res.render('generos/list', { generos });
    } catch (err) {
        res.status(500).send('Erro ao listar os gêneros: ' + err.message);
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





exports.deleteGenero = async (req, res) => {
    try {
        const { id } = req.params;

        // Remover o gênero dos discos
        await DiscoModel.updateMany(
            { generos: id },
            { $pull: { generos: id } }
        );

        // Remover o gênero em si
        await Genero.findByIdAndDelete(id);

        res.redirect('/generos');
    } catch (err) {
        res.status(500).send('Erro ao remover gênero: ' + err.message);
    }
};

exports.updateGenero = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome } = req.body;

        const genero = await Genero.findById(id);
        genero.nome = nome;

        await genero.save();

        res.redirect('/generos');
    } catch (err) {
        res.status(500).send('Erro ao atualizar gênero: ' + err.message);
    }
};

const GeneroModel = require('../models/genero');

exports.showEditForm = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar o gênero pelo ID
        const genero = await GeneroModel.findById(id);
        if (!genero) {
            return res.status(404).send('Gênero não encontrado');
        }

        res.render('generos/edit', { genero });
    } catch (err) {
        res.status(500).send('Erro ao carregar formulário de edição: ' + err.message);
    }
};

exports.updateGenero = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome } = req.body;

        // Atualizar o nome do gênero
        const genero = await GeneroModel.findById(id);
        if (!genero) {
            throw new Error('Gênero não encontrado');
        }

        genero.nome = nome;

        await genero.save();

        res.redirect('/generos');
    } catch (err) {
        res.status(500).send('Erro ao atualizar gênero: ' + err.message);
    }
};



exports.deleteGenero = async (req, res) => {
    try {
        const { id } = req.params;

        // Remover o gênero
        await GeneroModel.findByIdAndDelete(id);

        res.redirect('/generos');
    } catch (err) {
        res.status(500).send('Erro ao remover gênero: ' + err.message);
    }
};