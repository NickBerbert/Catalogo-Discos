const express = require('express');
const router = express.Router();
const artistasController = require('../controllers/artistaController');

router.get('/create', artistasController.showCreateForm);
router.post('/', artistasController.createArtista);
router.get('/', artistasController.getAllArtistas);
module.exports = router;