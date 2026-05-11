const axios = require("axios");

const AUTH_KEY = "514878AsXkRcWtbSy569fd9a66P1";

const sendOtpSMS = async (mobile) => {
    console.log("Sending OTP to:", mobile);
  try {
    const response = await axios.get(
      `https://api.msg91.com/api/v5/otp?mobile=91${mobile}&authkey=${AUTH_KEY}`
    );

    console.log("MSG91 OTP Sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("MSG91 Error:", error.response?.data || error.message);
    throw new Error("Failed to send OTP");
  }
};

const verifyOtpSMS = async (mobile, otp) => {
    console.log(`Verifying OTP for ${mobile}: ${otp}`);
  try {
    const response = await axios.get(
      `https://api.msg91.com/api/v5/otp/verify?mobile=91${mobile}&otp=${otp}&authkey=${AUTH_KEY}`
    );

    return response.data;
  } catch (error) {
    console.error("MSG91 Verify Error:", error.response?.data || error.message);
    throw new Error("OTP verification failed");
  }
};

module.exports = { sendOtpSMS, verifyOtpSMS };