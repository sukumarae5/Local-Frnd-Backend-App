const jwt = require("jsonwebtoken");
const db = require("../config/db");

module.exports = async (socket, next) => {
  try {
    // 🔥 Allow reconnect without re-auth
    if (socket.user) {
      return next();
    }

    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("UNAUTHORIZED"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query(
      "SELECT user_id, gender FROM user WHERE user_id = ? LIMIT 1",
      [decoded.user_id]
    );

    if (!rows.length) return next(new Error("UNAUTHORIZED"));

    socket.user = {
      user_id: rows[0].user_id,
      gender: rows[0].gender,
    };

    console.log("✅ Socket authenticated:", socket.user);
    next();
  } catch (err) {
    console.log("❌ Socket auth error:", err.message);
    next(new Error("UNAUTHORIZED"));
  }
};
