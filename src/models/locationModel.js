const db = require("../config/db");

// 🔹 GET ALL COUNTRIES
async function getAllCountries() {
  const [rows] = await db.query(
    "SELECT id, name, iso_code, flag_url FROM countries WHERE is_active = 1 ORDER BY name"
  );
  return rows;
}

// 🔹 GET STATES BY COUNTRY
async function getStatesByCountry(country_id) {
  const [rows] = await db.query(
    "SELECT id, name FROM states WHERE country_id = ? AND is_active = 1 ORDER BY name",
    [country_id]
  );
  return rows;
}

// 🔹 GET CITIES BY STATE
async function getCitiesByState(state_id) {
  const [rows] = await db.query(
    "SELECT id, name FROM cities WHERE state_id = ? AND is_active = 1 ORDER BY name",
    [state_id]
  );
  return rows;
}

module.exports = {
  getAllCountries,
  getStatesByCountry,
  getCitiesByState
};
