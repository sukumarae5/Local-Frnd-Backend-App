const coinPackageService = require("../services/coinPackageServices");

const getAllCoinPackages = async (req, res) => {
  try {
    const data = await coinPackageService.getAllCoinPackages();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCoinPackageById = async (req, res) => {
  try {
    const data = await coinPackageService.getCoinPackageById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addCoinPackage = async (req, res) => {
  try {
    const data = await coinPackageService.addCoinPackage(req.body);

    res.json({
      message: "Coin package created",
      data
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCoinPackage = async (req, res) => {
  try {
    const data = await coinPackageService.updateCoinPackage(
      req.params.id,
      req.body
    );

    res.json({
      message: "Coin package updated",
      data
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCoinPackage = async (req, res) => {
  try {
    const data = await coinPackageService.deleteCoinPackage(req.params.id);

    res.json({
      message: "Coin package deleted",
      data
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// const deleteCoinPackage = async (req, res) => {

//   try {

//     const id = req.params.id;

//     const data = await coinPackageService.deleteCoinPackage(id);

//     if (data.affectedRows === 0) {
//       return res.status(404).json({
//         message: "Coin package not found"
//       });
//     }

//     res.json({
//       message: "Coin package deleted permanently"
//     });

//   } catch (error) {

//     res.status(500).json({
//       message: error.message
//     });

//   }

// };

module.exports = {
  getAllCoinPackages,
  getCoinPackageById,
  addCoinPackage,
  updateCoinPackage,
  deleteCoinPackage
};