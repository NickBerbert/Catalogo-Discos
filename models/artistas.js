const mongoose = require('mongoose');

const artistaSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true },
    generosMusicais: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genero' }],
    disco: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Disco' }]
});

module.exports = mongoose.model('Artistas', artistaSchema);