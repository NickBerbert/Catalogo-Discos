const Artista = require('../models/artistas');

// Obter todos os artistas
exports.getAllArtistas = async (req, res) => {
    try {
        const artistas = await ArtistaModel.find().populate('disco'); // Popula os títulos dos discos
        res.render('artistas/list', { artistas });
    } catch (err) {
        res.status(500).send('Erro ao carregar artistas: ' + err.message);
    }
};

// Criar um novo artista
const ArtistaModel = require('../models/artistas');
const DiscoModel = require('../models/disco');

exports.createArtista = async (req, res) => {
    try {
        // Certifique-se de que discos é um array
        const discosSelecionados = Array.isArray(req.body.discos)
            ? req.body.discos
            : [req.body.discos];

        // Verifica e valida os discos associados
        const discos = await Promise.all(
            discosSelecionados.map(async (id) => {
                const disco = await DiscoModel.findById(id.trim());
                if (!disco) {
                    throw new Error(`Disco com ID ${id} não encontrado.`);
                }
                return disco._id; // Retorna apenas o ID do disco
            })
        );

        // Cria o novo artista com os discos associados
        const novoArtista = new ArtistaModel({
            nome: req.body.nome,
            discos // Associa os IDs dos discos ao artista
        });

        await novoArtista.save();

        res.redirect('/artistas');
    } catch (err) {
        res.status(400).send('Erro ao salvar o artista: ' + err.message);
    }
};
// Obter um único artista pelo ID
exports.getArtistaById = async (req, res) => {
    try {
        const artista = await Artista.findById(req.params.id).populate('generos').populate('discos');
        if (!artista) return res.status(404).send('Artista não encontrado.');
        res.json(artista);
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// Atualizar um artista
exports.updateArtista = async (req, res) => {
    try {
        const artista = await Artista.findByIdAndUpdate(
            req.params.id,
            {
                nome: req.body.nome,
                generos: req.body.generos.split(','),
                discos: req.body.discos.split(',')
            },
            { new: true }
        );
        if (!artista) return res.status(404).send('Artista não encontrado.');
        res.redirect('/artistas');
    } catch (err) {
        res.status(400).send(err.message);
    }
};

exports.deleteArtista = async (req, res) => {
    try {
        const artista = await Artista.findByIdAndDelete(req.params.id);
        if (!artista) return res.status(404).send('Artista não encontrado.');
        res.redirect('/artistas');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.showCreateForm = async (req, res) => {
    try {
        const discos = await DiscoModel.find(); // Recupera todos os discos para exibição no formulário
        res.render('artistas/create', { discos });
    } catch (err) {
        res.status(500).send('Erro ao carregar o formulário: ' + err.message);
    }
};