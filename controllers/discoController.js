const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const DiscoModel = require('../models/disco');
const Artista = require('../models/artistas');


// Configuração do armazenamento do Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads')); // Diretório para salvar as imagens
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '' + file.originalname); // Nome do arquivo com timestamp
    }
});

// Filtro para aceitar apenas arquivos de imagem
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Arquivo não é uma imagem válida!'), false);
    }
};

// Instância do Multer
const upload = multer({ storage: storage, fileFilter: fileFilter });
module.exports.upload = upload; // Exporta o middleware
exports.getAllDiscos = async (req, res) => {
    try {
        const { titulo, genero, anoLancamento } = req.query;

        // Construir os critérios de busca dinamicamente
        const query = {};

        if (titulo) {
            query.titulo = new RegExp(titulo, 'i'); // Filtro por título (case insensitive)
        }

        if (genero) {
            // Buscar os IDs de todos os gêneros correspondentes ao nome
            const generosEncontrados = await GeneroModel.find({ nome: new RegExp(genero, 'i') });
            if (generosEncontrados.length > 0) {
                query.generos = { $in: generosEncontrados.map(g => g._id) }; // Filtrar por IDs
            } else {
                // Se nenhum gênero for encontrado, garantir que nenhum resultado será retornado
                query.generos = { $exists: false };
            }
        }

        if (anoLancamento) {
            query.anoLancamento = anoLancamento; // Filtro por ano
        }

        // Buscar discos com base nos critérios
        const discos = await DiscoModel.find(query).populate('generos');

        res.render('discos/list', {
            discos,
            filtroTitulo: titulo || '', // Preservar valor do filtro na view
            filtroGenero: genero || '',
            filtroAnoLancamento: anoLancamento || '',
        });
    } catch (err) {
        res.status(500).send('Erro ao filtrar discos: ' + err.message);
    }
};



exports.showCreateForm = (req, res) => {
    res.render('discos/create'); 
};

const GeneroModel = require('../models/genero'); // Importar modelo de gênero
const ArtistaModel = require('../models/artistas'); // Importar modelo de artista

exports.createDisco = async (req, res) => {
    try {
       


        const generos = await Promise.all(

            req.body.generos.split(',').map(async (nome) => {
                nome = nome.trim();
                let genero = await GeneroModel.findOne({ nome }); // Buscar pelo nome
                if (!genero) {
                    genero = await GeneroModel.create({ nome }); // Criar se não existir
                }
                return genero._id; // Retornar o ID
            })
        );


        // Criar o disco
        const novoDisco = new DiscoModel({
            titulo: req.body.titulo,
            anoLancamento: req.body.anoLancamento,
            capa: req.file ?`/uploads/${req.file.filename}` : '',
            faixas: req.body.faixas.split(','),
            generos: generos // IDs de gêneros
            
        });

        await novoDisco.save();
        console.log("Esse é o meu disco" + JSON.stringify(novoDisco))
        res.redirect('/disco');
    } catch (err) {
        res.status(400).send('Erro ao salvar o disco: ' + err.message);
    }
};
exports.showEditForm = async (req, res) => {
    try {
        const { id } = req.params;
        const disco = await DiscoModel.findById(id).populate('generos'); // Buscar o disco e popular os gêneros
        if (!disco) {
            return res.status(404).send('Disco não encontrado.');
        }

        const artistas = await ArtistaModel.find(); // Buscar todos os artistas
        res.render('discos/edit', { disco, artistas }); // Passar artistas para a view
    } catch (err) {
        res.status(500).send('Erro ao carregar o formulário de edição: ' + err.message);
    }
};

exports.deleteDisco = async (req, res) => {
    try {
        const { id } = req.params;

        // Remover o disco dos artistas
        await Artista.updateMany(
            { disco: id },
            { $pull: { disco: id } }
        );

        // Remover o disco em si
        await DiscoModel.findByIdAndDelete(id);

        res.redirect('/disco');
    } catch (err) {
        res.status(500).send('Erro ao remover disco: ' + err.message);
    }
};

exports.updateDisco = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, anoLancamento, faixas, generos } = req.body;

        // Buscar ou criar os gêneros pelo nome
        const generoIds = await Promise.all(
            generos.split(',').map(async (nome) => {
                nome = nome.trim();
                let genero = await GeneroModel.findOne({ nome });
                if (!genero) {
                    genero = await GeneroModel.create({ nome }); // Criar gênero se não existir
                }
                return genero._id; // Retornar o ID
            })
        );

        // Atualizar o disco
        const disco = await DiscoModel.findById(id);
        disco.titulo = titulo;
        disco.anoLancamento = anoLancamento;
        disco.faixas = faixas.split(',').map((faixa) => faixa.trim());
        disco.generos = generoIds; // Associar os IDs de gênero

        if (req.file) {
            disco.capa = `/uploads/${req.file.filename}`; // Atualizar capa se houver upload
        }

        await disco.save();

        res.redirect('/disco');
    } catch (err) {
        res.status(500).send('Erro ao atualizar disco: ' + err.message);
    }
};
exports.filterDiscos = async (req, res) => {
    try {
        const { titulo, genero, anoLancamento } = req.query;

        // Construção do filtro dinâmico
        const filtro = {};

        // Filtro por título (case insensitive)
        if (titulo) {
            filtro.titulo = new RegExp(titulo, 'i');
        }

        // Filtro por gênero
        if (genero) {
            const generoEncontrado = await GeneroModel.findOne({ nome: genero.trim() });
            if (!generoEncontrado) {
                return res.status(404).send('Gênero não encontrado');
            }
            filtro.generos = generoEncontrado._id; // Use o ObjectId do gênero
        }

        // Filtro por ano de lançamento
        if (anoLancamento) {
            filtro.anoLancamento = anoLancamento;
        }

        // Buscar discos com os filtros aplicados
        const discos = await DiscoModel.find(filtro).populate('generos');

        // Renderizar a view com os discos e os filtros aplicados
        res.render('discos/list', {
            discos,
            filtroTitulo: titulo || '',
            filtroGenero: genero || '',
            filtroAnoLancamento: anoLancamento || ''
        });
    } catch (err) {
        res.status(500).send('Erro ao filtrar discos: ' + err.message);
    }
};