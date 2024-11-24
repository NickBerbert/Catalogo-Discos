const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const DiscoModel = require('../models/disco');

// Configuração do armazenamento do Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads')); // Diretório para salvar as imagens
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Nome do arquivo com timestamp
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

// Métodos do controlador
exports.getAllDiscos = async (req, res) => {
    try {
        const discos = await DiscoModel.find().populate('generos artistas');
        res.render('discos/list', { discos });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.showCreateForm = (req, res) => {
    res.render('discos/create'); 
};

const GeneroModel = require('../models/genero'); // Importar modelo de gênero
const ArtistaModel = require('../models/artistas'); // Importar modelo de artista

exports.createDisco = async (req, res) => {
    try {
        // Processar gêneros
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

        // Processar artistas
        const artistas = await Promise.all(
            req.body.artistas.split(',').map(async (nome) => {
                nome = nome.trim();
                let artista = await ArtistaModel.findOne({ nome }); // Buscar pelo nome
                if (!artista) {
                    artista = await ArtistaModel.create({ nome, generos: [], discos: [] }); // Criar se não existir
                }
                return artista._id; // Retornar o ID
            })
        );

        // Criar o disco
        const novoDisco = new DiscoModel({
            titulo: req.body.titulo,
            anoLancamento: req.body.anoLancamento,
            capa: req.file ?`/uploads/${req.file.filename}` : '',
            faixas: req.body.faixas.split(','),
            generos, // IDs de gêneros
            artistas // IDs de artistas
        });

        await novoDisco.save();
        res.redirect('/disco');
    } catch (err) {
        res.status(400).send('Erro ao salvar o disco: ' + err.message);
    }
};

