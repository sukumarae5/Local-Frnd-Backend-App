const express = require('express');
const router = express.Router();
const UserInterestController = require('../controllers/userinterestController');
const {authenticateUser} = require('../middlewares/authMiddleware');

router.post('/',authenticateUser, UserInterestController.saveUserInterests);

router.get('/:user_id',authenticateUser, UserInterestController.getUserInterests);

module.exports = router;
