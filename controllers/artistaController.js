const Artista = require('../models/artistas');
const discoController = require('../controllers/discoController.js')

// Obter todos os artistas
const ArtistaModel = require('../models/artistas');
const DiscoModel = require('../models/disco');

exports.getAllArtistas = async (req, res) => {
    try {
        const { artista, titulo } = req.query;

        // Filtros dinâmicos
        const filtro = {};
        if (artista) {
            filtro.nome = new RegExp(artista, 'i'); // Filtro de nome de artista (caseinsensitive)
        }
        if (titulo) {
            const discosFiltrados = await DiscoModel.find({ titulo: new RegExp(titulo, 'i') }).select('_id');
            const idsDiscos = discosFiltrados.map(disco => disco._id);
            filtro.disco = { $in: idsDiscos }; // Filtrar artistas associados a discos com o título
        }

        // Busca os artistas com os filtros aplicados
        const artistas = await ArtistaModel.find(filtro).populate('disco'); // Popula os discos relacionados

        res.render('artistas/list', {
            artistas,
            filtroArtista: artista || '',
            filtroTitulo: titulo || ''
        });
    } catch (err) {
        res.status(500).send('Erro ao carregar artistas: ' + err.message);
    }
    
};

// Criar um novo artista

exports.createArtista = async (req, res) => {
    try {
        console.log('Discos recebidos:', req.body.discos);

        // Certifiquese de que discos é um array
        const discosSelecionados = Array.isArray(req.body.discos)
            ? req.body.discos
            : [req.body.discos];

        console.log('Discos processados:', discosSelecionados);

        // Verifica e valida os discos associados
        const discos = await Promise.all(
            discosSelecionados.map(async (id) => {
                const disco = await DiscoModel.findById(id.trim());
                if (!disco) {
                    throw new Error(`Disco com ID ${id} não encontrado.`);
                }
                return disco._id;
            })
        );

        console.log('Discos encontrados no banco:', discos);

        // Verifica se o artista já existe
        let artista = await ArtistaModel.findOne({ nome: req.body.nome });

        if (artista) {
            console.log('Artista já existe, atualizando discos...');

            // Adiciona novos discos ao artista, sem duplicar
            const novosDiscos = discos.filter((id) => !artista.disco.includes(id));
            artista.disco.push(...novosDiscos);

            await artista.save();
            console.log('Artista atualizado com sucesso:', artista);
        } else {
            console.log('Criando novo artista...');

            // Cria um novo artista
            artista = new ArtistaModel({
                nome: req.body.nome,
                disco: discos
            });

            await artista.save();
            console.log('Novo artista salvo com sucesso:', artista);
        }
        discoController.getAllDiscos;
        res.redirect('/artistas');
    } catch (err) {
        console.error('Erro ao salvar o artista:', err.message);
        res.status(400).send('Erro ao salvar o artista: ' + err.message);
    }
};
// Obter um único artista pelo ID
exports.getArtistaById = async (req, res) => {
    try {
        const artista = await Artista.findById(req.params.id).populate('generos').populate('discos');
        if (!artista) return res.status(404).send('Artista não encontrado.');
        res.render('artistas/edit', {artista});
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


exports.deleteArtista = async (req, res) => {
    try {
        const { id } = req.params;

        // Remover o artista dos discos
        await DiscoModel.updateMany(
            { artistas: id },
            { $pull: { artistas: id } } // Remove a referência do artista nos discos
        );

        // Remover o artista em si
        await ArtistaModel.findByIdAndDelete(id);

        res.redirect('/artistas');
    } catch (err) {
        res.status(500).send('Erro ao remover artista: ' + err.message);
    }
};

exports.updateArtista = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, discos } = req.body;

        // Buscar discos existentes pelo ID
        const discoIds = discos
            ? discos.split(',').map(discoId => discoId.trim())
            : []; // Array vazio caso nenhum disco seja enviado

        // Atualizar o artista
        const artista = await ArtistaModel.findById(id);
        if (!artista) {
            throw new Error('Artista não encontrado');
        }

        artista.nome = nome;
        artista.disco = discoIds; // Associar discos ao artista

        await artista.save();

        res.redirect('/artistas');
    } catch (err) {
        res.status(500).send('Erro ao atualizar artista: ' + err.message);
    }
};
exports.showEditForm = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar o artista pelo ID
        const artista = await ArtistaModel.findById(id).populate('disco');
        if (!artista) {
            return res.status(404).send('Artista não encontrado');
        }

        // Buscar todos os discos para exibição no dropdown
        const discos = await DiscoModel.find();

        res.render('artistas/edit', { artista, discos });
    } catch (err) {
        res.status(500).send('Erro ao carregar formulário de edição: ' + err.message);
    }
};

