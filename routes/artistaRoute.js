const express = require('express');
const router = express.Router();
const artistasController = require('../controllers/artistaController');

router.get('/create', artistasController.showCreateForm);
router.post('/', artistasController.createArtista);
router.get('/', artistasController.getAllArtistas);




router.get('/edit/:id', artistasController.showEditForm); // Rota para editar artista
router.post('/delete/:id', artistasController.deleteArtista); // Rota para remover artista
router.post('/edit/:id', artistasController.updateArtista); // Rota para remover artista

module.exports = router;