// routes/interest.routes.js
const express = require('express');
const router = express.Router();
const InterestController = require('../controllers/interestController');

// Admin / Master APIs
router.post('/add', InterestController.add);        // Add
router.put('/:id', InterestController.update); // Update
router.delete('/:id', InterestController.remove); // Delete
router.get('/all', InterestController.getAll);     // Get all

module.exports = router;
