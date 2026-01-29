const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

// 🔹 GET COUNTRIES
router.get("/countries", locationController.getCountries);

// 🔹 GET STATES BY COUNTRY
router.get("/states", locationController.getStates);

// 🔹 GET CITIES BY STATE
router.get("/cities", locationController.getCities);

module.exports = router;
