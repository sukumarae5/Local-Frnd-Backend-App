// routes/interest.routes.js
const express = require('express');
const router = express.Router();
const InterestController = require('../controllers/interestController');

// Admin / Master APIs
router.post('/', InterestController.add);        // Add
router.put('/:id', InterestController.update); // Update
router.delete('/:id', InterestController.remove); // Delete
router.get('/', InterestController.getAll);     // Get all

module.exports = router;
