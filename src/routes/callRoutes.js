const express= require("express")
const router=express.Router()

const callController= require("../controllers/callController")
const { authenticateUser } = require("../middlewares/authMiddleware");

router.post("/initiate", authenticateUser, callController.initiate);
router.post("/random-connect", authenticateUser, callController.randomConnect);

router.get("/status/:sessionId", authenticateUser, callController.status);
router.post("/hangup", authenticateUser, callController.hangup);


module.exports=router