const express = require('express');
const router = express.Router();
const discoController = require('../controllers/discoController');
// Rota para exibir o formulário de cadastro
router.get('/create', discoController.showCreateForm);

// Rota para processar o formulário e salvar o disco
const { upload } = discoController;
router.get('/', discoController.getAllDiscos);

router.get('/delete/:id',discoController.deleteDisco);

router.get('/edit/:id', discoController.showEditForm); // Exibe o formulário de edição
router.post('/edit/:id', upload.single('capa'), discoController.updateDisco); // Atualiza o disco
router.post('/delete/:id', discoController.deleteDisco);
router.get('/filter', discoController.filterDiscos);



router.post('/', upload.single('capa'), discoController.createDisco);

module.exports = router;