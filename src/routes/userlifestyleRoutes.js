// routes/userlifestyleRoutes.js

const express = require('express');
const router = express.Router();
const Controller = require('../controllers/userlifestyleController');
const { authenticateUser } = require('../middlewares/authMiddleware');

router.post('/', authenticateUser, Controller.save);

router.put('/', authenticateUser, Controller.update);

router.delete('/', authenticateUser, Controller.remove);

router.get('/me', authenticateUser, Controller.getMy);

router.get('/me/:lifestyle_id', authenticateUser, Controller.getMyOne);
router.get('/',  Controller.getAll);
router.get('/user/:user_id', authenticateUser, Controller.getByUser);



module.exports = router;
