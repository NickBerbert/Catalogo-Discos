const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
app.use(express.static('public'));
const dbURI = 'mongodb://localhost:27017/catalogo';


const Artista = require('./models/artistas'); // Caminho correto para o modelo



mongoose
    .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado ao MongoDB!'))
    .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));



// Configurações
app.set('view engine', 'ejs'); // Usando EJS para as views
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rotas
const discoRoutes = require('./routes/discoRoute');
const artistasRoutes = require('./routes/artistaRoute');
const generoRoutes = require('./routes/generoRoute');

app.use('/disco', discoRoutes);
app.use('/artistas', artistasRoutes);
app.use('/genero', generoRoutes);
app.get('/', (req, res) => {
    res.render('index'); // Renderiza a view "index.ejs"
});
// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});