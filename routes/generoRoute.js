const express = require('express');
const router = express.Router();
const generoController = require('../controllers/generoController');

router.get('/', generoController.getAllGeneros);
router.post('/', generoController.createGenero);

module.exports = router;