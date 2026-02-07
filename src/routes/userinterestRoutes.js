const express = require('express');
const router = express.Router();
const UserInterestController = require('../controllers/userinterestController');
const {authenticateUser} = require('../middlewares/authMiddleware');

router.post('/',authenticateUser, UserInterestController.saveUserInterests);

router.put('/', authenticateUser, UserInterestController.updateUserInterests);

router.delete('/', authenticateUser, UserInterestController.deleteUserInterests);

router.get('/:user_id',authenticateUser, UserInterestController.getUserInterests);

module.exports = router;
