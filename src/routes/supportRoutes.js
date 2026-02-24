const express = require("express");
const router = express.Router();
const supportController = require("../controllers/supportController");

router.post("/", supportController.createTicket);
router.get("/", supportController.getAllTickets);
router.get("/:id", supportController.getTicket);
router.put("/:id", supportController.updateTicket);
router.delete("/:id", supportController.deleteTicket);

module.exports = router;
