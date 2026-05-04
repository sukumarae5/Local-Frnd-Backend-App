const purchaseService = require("../services/purchaseService");

/* =============================
   CREATE ORDER
============================= */
const createOrder = async (req, res) => {
  console.log(req.body)
  try {
    const { package_id } = req.body;
    const user_id = req.user.user_id;

    const data = await purchaseService.createOrder(
      package_id,
      user_id
    );

    res.json({
      success: true,
      data
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/* =============================
   VERIFY PAYMENT
============================= */
const verifyPayment = async (req, res) => {
  console.log(req.body)
  try {
    const user_id = req.user.user_id;
console.log("User ID:", user_id); // Debug log
    const data = await purchaseService.verifyPayment(
      req.body,
      user_id
    );

    res.json({
      success: true,
      data
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment
};