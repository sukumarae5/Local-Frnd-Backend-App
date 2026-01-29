const express = require('express');
const router = express.Router();
const Controller = require('../controllers/userlifestyleController');

router.post('/', Controller.save);
router.get('/:user_id', Controller.getByUser);

module.exports = router;
