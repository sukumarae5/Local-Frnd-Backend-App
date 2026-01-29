const locationModel = require("../models/locationModel");

// 🔹 GET COUNTRIES SERVICE
async function fetchCountries() {
  return await locationModel.getAllCountries();
}

// 🔹 GET STATES SERVICE
async function fetchStates(country_id) {
  if (!country_id) {
    throw new Error("country_id is required");
  }
  return await locationModel.getStatesByCountry(country_id);
}

// 🔹 GET CITIES SERVICE
async function fetchCities(state_id) {
  if (!state_id) {
    throw new Error("state_id is required");
  }
  return await locationModel.getCitiesByState(state_id);
}

module.exports = {
  fetchCountries,
  fetchStates,
  fetchCities
};
