const authService = require("../services/authServices");

// Register new user
exports.registerUser = async (req, res) => {
  try {
    const { mobile_number } = req.body;
    if (!mobile_number)
      return res.status(400).json({ success: false, message: "Mobile number is required" });
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile_number)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number. It must be exactly 10 digits.",
      });
    }
    const result = await authService.registerUser(mobile_number);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send OTP for login
exports.sendLoginOtp = async (req, res) => {
  try {
    const { mobile_number } = req.body;
    if (!mobile_number)
      return res.status(400).json({ success: false, message: "Mobile number is required" });

    const result = await authService.sendLoginOtp(mobile_number);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify OTP

exports.verifyOtp = async (req, res) => {
  try {
    const { mobile_number, otp } = req.body;
    console.log(mobile_number, otp);
    if (!mobile_number || !otp)
      return res.status(400).json({ success: false, message: "Mobile number and OTP are required" });

    const result = await authService.verifyOtp(mobile_number, otp);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
