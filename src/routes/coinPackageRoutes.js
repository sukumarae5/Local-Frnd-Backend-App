const express = require("express");
const router = express.Router();

const coinPackageController = require("../controllers/coinPackageController");

router.get("/", coinPackageController.getAllCoinPackages);

router.get("/:id", coinPackageController.getCoinPackageById);

router.post("/", coinPackageController.addCoinPackage);

router.put("/:id", coinPackageController.updateCoinPackage);

router.delete("/:id", coinPackageController.deleteCoinPackage);

// router.delete("/:id", coinPackageController.deleteCoinPackage);

module.exports = router;