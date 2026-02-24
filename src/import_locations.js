// const fs = require("fs");
// const path = require("path");
// const db = require("./config/db");   // ✅ correct for src/import_locations.js

// async function importData() {
//   try {
//     console.log("🟢 Starting location import...");

//     // 🔹 Resolve file paths (because JSON files are outside src/)
//     const countriesPath = path.join(__dirname, "../countries.json");
//     const statesPath = path.join(__dirname, "../states.json");
//     const citiesPath = path.join(__dirname, "../cities.json");

//     const countries = JSON.parse(fs.readFileSync(countriesPath, "utf8"));
//     const states = JSON.parse(fs.readFileSync(statesPath, "utf8"));
//     const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));

//     // Insert countries
//     for (let c of countries) {
//       await db.query(
//         "INSERT INTO countries (id, name, iso_code, is_active) VALUES (?, ?, ?, 1)",
//         [c.id, c.name, c.iso2]
//       );
//     }
//     console.log("🌍 Countries inserted");

//     // Insert states
//     for (let s of states) {
//       await db.query(
//         "INSERT INTO states (id, country_id, name, state_code, is_active) VALUES (?, ?, ?, ?, 1)",
//         [s.id, s.country_id, s.name, s.state_code]
//       );
//     }
//     console.log("🏙 States inserted");

//     // Insert cities
//     for (let ci of cities) {
//       await db.query(
//         "INSERT INTO cities (id, state_id, name, is_active) VALUES (?, ?, ?, 1)",
//         [ci.id, ci.state_id, ci.name]
//       );
//     }
//     console.log("🏘 Cities inserted");

//     console.log("🎉 ALL LOCATION DATA IMPORTED SUCCESSFULLY!");
//     process.exit();

//   } catch (err) {
//     console.error("🔴 Import failed:", err);
//     process.exit(1);
//   }
// }

// importData();


const fs = require("fs");
const path = require("path");
const db = require("./config/db");

// 🔴 CHANGE / ADD COUNTRIES HERE (by ISO2 code)
const ALLOWED_COUNTRIES = ["IN", "US", "GB", "CA", "AU", "DE", "FR"];  
// IN = India, US = USA, GB = UK, CA = Canada, AU = Australia, DE = Germany, FR = France

async function importData() {
  try {
    console.log("🟢 Starting LIMITED location import...");

    const countriesPath = path.join(__dirname, "../countries.json");
    const statesPath = path.join(__dirname, "../states.json");
    const citiesPath = path.join(__dirname, "../cities.json");

    const countriesAll = JSON.parse(fs.readFileSync(countriesPath, "utf8"));
    const statesAll = JSON.parse(fs.readFileSync(statesPath, "utf8"));
    const citiesAll = JSON.parse(fs.readFileSync(citiesPath, "utf8"));

    // 🔹 Filter allowed countries
    const countries = countriesAll.filter(c =>
      ALLOWED_COUNTRIES.includes(c.iso2)
    );

    const allowedCountryIds = countries.map(c => c.id);

    // 🔹 Filter states of allowed countries
    const states = statesAll.filter(s =>
      allowedCountryIds.includes(s.country_id)
    );

    const allowedStateIds = states.map(s => s.id);

    // 🔹 Filter cities of allowed states
    const cities = citiesAll.filter(ci =>
      allowedStateIds.includes(ci.state_id)
    );

    console.log(`🌍 Countries selected: ${countries.length}`);
    console.log(`🏙 States selected: ${states.length}`);
    console.log(`🏘 Cities selected: ${cities.length}`);

    // 🔹 Disable FK checks for fast insert
    await db.query("SET FOREIGN_KEY_CHECKS = 0");

    // Insert countries
    // Insert countries WITH FLAG URL
const countryValues = countries.map(c => {
  const flagUrl = `https://flagcdn.com/w40/${c.iso2.toLowerCase()}.png`;
  return [c.id, c.name, c.iso2, flagUrl, 1];
});

await db.query(
  "INSERT INTO countries (id, name, iso_code, flag_url, is_active) VALUES ?",
  [countryValues]
);

    console.log("🌍 Countries inserted");

    // Insert states in chunks
    const stateChunkSize = 500;
    for (let i = 0; i < states.length; i += stateChunkSize) {
      const chunk = states.slice(i, i + stateChunkSize);
      const values = chunk.map(s => [s.id, s.country_id, s.name, s.iso2, 1]);

      await db.query(
        "INSERT INTO states (id, country_id, name, state_code, is_active) VALUES ?",
        [values]
      );

      console.log(`🏙 States inserted: ${i + chunk.length}`);
    }

    // Insert cities in chunks
    const cityChunkSize = 1000;
    for (let i = 0; i < cities.length; i += cityChunkSize) {
      const chunk = cities.slice(i, i + cityChunkSize);
      const values = chunk.map(ci => [ci.id, ci.state_id, ci.name, 1]);

      await db.query(
        "INSERT INTO cities (id, state_id, name, is_active) VALUES ?",
        [values]
      );

      console.log(`🏘 Cities inserted: ${i + chunk.length}`);
    }

    // Re-enable FK checks
    await db.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("🎉 LIMITED LOCATION DATA IMPORTED SUCCESSFULLY!");
    process.exit();

  } catch (err) {
    console.error("🔴 Import failed:", err);
    process.exit(1);
  }
}

importData();
