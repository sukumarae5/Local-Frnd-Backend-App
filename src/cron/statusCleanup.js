const cron = require("node-cron");
const db = require("../config/db");

cron.schedule("0 * * * *", async () => {

  try {

    console.log("Cleaning expired statuses...");

    await db.query(`
      DELETE FROM user_status
      WHERE expires_at < NOW()
    `);

  } catch (err) {

    console.error("Status cleanup error:", err);

  }

});