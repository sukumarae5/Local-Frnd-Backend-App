// controllers/interest.controller.js
const InterestService = require('../services/interestServices');



const  add= async (req, res) => {
    try {
      const { name } = req.body;
console.log(req.body)
      const interest = await InterestService.addInterest(name);

      res.json({
        success: true,
        message: "Interest added successfully",
        data: interest
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // ✏️ Update Interest
 const update= async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      await InterestService.updateInterest(id, name);

      res.json({
        success: true,
        message: "Interest updated successfully"
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // ❌ Delete Interest
 const  remove= async (req, res) => {
    try {
      const { id } = req.params;

      await InterestService.deleteInterest(id);

      res.json({
        success: true,
        message: "Interest deleted successfully"
      });

    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // 📄 Get All Interests
  const getAll= async (req, res) => {
    try {
      const interests = await InterestService.getAllInterests();

      res.json({
        success: true,
        message: "Interests fetched successfully",
        data: interests
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch interests"
      });
    }
  }


module.exports = {
    add,
    update,
    remove,
    getAll
};
