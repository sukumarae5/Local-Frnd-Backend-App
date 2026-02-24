const express = require('express');
const router = express.Router();
const Controller = require('../controllers/lifestylecategoryController');

router.post('/', Controller.add);
router.put('/:id', Controller.update);
router.delete('/:id', Controller.remove);
router.get('/all', Controller.getAll);

module.exports = router;
