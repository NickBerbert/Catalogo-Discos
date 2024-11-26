const express = require('express');
const router = express.Router();
const generoController = require('../controllers/generoController');

router.get('/', generoController.getAllGeneros);

router.get('/delete/:id',generoController.deleteGenero);
router.get('/edit/:id', generoController.showEditForm);
router.post('/edit/:id', generoController.updateGenero);

router.post('/delete/:id', generoController.deleteGenero);

    
module.exports = router;