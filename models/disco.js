const mongoose = require('mongoose');

const discoSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    anoLancamento: { type: Number, required: true },
    capa: String,
    faixas: [String],
    generos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genero' }]
});

module.exports = mongoose.model('Disco', discoSchema);