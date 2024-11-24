const express = require('express');
const router = express.Router();
const discoController = require('../controllers/discoController');
// Rota para exibir o formulário de cadastro
router.get('/create', discoController.showCreateForm);

// Rota para processar o formulário e salvar o disco

router.get('/', discoController.getAllDiscos);

const { upload } = discoController;
router.post('/', upload.single('capa'), discoController.createDisco);

module.exports = router;