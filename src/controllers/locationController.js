const locationService = require("../services/locationService");

// 🔹 GET COUNTRIES CONTROLLER
async function getCountries(req, res) {
  try {
    const data = await locationService.fetchCountries();
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error in getCountries:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// 🔹 GET STATES CONTROLLER
async function getStates(req, res) {
  const { country_id } = req.query;

  try {
    const data = await locationService.fetchStates(country_id);
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error in getStates:", err);
    res.status(400).json({ success: false, message: err.message });
  }
}

// 🔹 GET CITIES CONTROLLER
async function getCities(req, res) {
  const { state_id } = req.query;

  try {
    const data = await locationService.fetchCities(state_id);
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error in getCities:", err);
    res.status(400).json({ success: false, message: err.message });
  }
}

module.exports = {
  getCountries,
  getStates,
  getCities
};
