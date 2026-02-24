const router = require("express").Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const coinController = require("../controllers/coinController");

router.get("/wallet", authenticateUser, coinController.wallet);

module.exports = router;
