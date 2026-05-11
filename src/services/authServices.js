const userModel = require("../models/user");
const { generateToken } = require("../utils/generateToken");

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const registerUser = async (mobile_number) => {
  const existingUser = await userModel.findByMobile(mobile_number);
  if (existingUser) {
    return { success: false, message: "User already registered. Please log in." };
  }

  await userModel.createUserIfNotExist(mobile_number);

  const otp = generateOtp();
  await userModel.createOrUpdateOtp(mobile_number, otp);

  console.log(`📲 Registration OTP for ${mobile_number} is ${otp}`);

  return {
    success: true,
    mode:"register",      
    message: "User registered. OTP sent successfully for verification.",
  };
};

const sendLoginOtp = async (mobile_number) => {
  const user = await userModel.findByMobile(mobile_number);
  if (!user) {
    return { success: false, message: "User not found. Please register first." };
  }

  const otp = generateOtp();    
  await userModel.createOrUpdateOtp(mobile_number, otp);
  console.log(`📲 Login OTP for ${mobile_number} is ${otp}`);

  return { success: true,mode:"login", message: "OTP sent successfully for login." };
};


// const verifyOtp = async (mobile_number, otp) => {
//   const user = await userModel.findByMobileAndOtp(mobile_number, otp);
//   if (!user) return { success: false, message: "Invalid number or OTP" };

//   await userModel.createUserIfNotExist(mobile_number);
//   await userModel.clearOtp(mobile_number);

//   const freshUser = await userModel.findByMobile(mobile_number);
//   const token = generateToken(freshUser);

//   return {
//     success: true,
//     token,
//     user: freshUser,
//     next_step: freshUser.profile_completed ? "home" : "complete_profile"
//   };
// };

const verifyOtp = async (mobile_number, otp) => {
  const user = await userModel.findByMobileAndOtp(mobile_number, otp);

  if (!user) {
    return { 
      success: false, 
      message: "Invalid or expired OTP" 
    };
  }

  await userModel.clearOtp(mobile_number);

  const freshUser = await userModel.findByMobile(mobile_number);
  const token = generateToken(freshUser);

  return {
    success: true,
    token,
    user: freshUser,
    next_step: freshUser.profile_completed ? "home" : "complete_profile"
  };
};

const resendOtp = async (mobile_number) => {
  const user = await userModel.findByMobile(mobile_number);

  if (!user) {
    return { success: false, message: "User not found" };
  }
if (user.otp_expires_at && new Date(user.otp_expires_at) > new Date()) {
  return {
    success: false,
    message: "Please wait before requesting new OTP"
  };
}

  const otp = generateOtp();
  await userModel.createOrUpdateOtp(mobile_number, otp);

  console.log(`🔁 Resend OTP for ${mobile_number}: ${otp}`);

  return { success: true, message: "OTP resent successfully" };
};


module.exports = {
  registerUser,
  sendLoginOtp,
  verifyOtp,
  resendOtp
};



// const userModel = require("../models/user");
// const { generateToken } = require("../utils/generateToken");
// const { sendOtpSMS, verifyOtpSMS } = require("../utils/msg91");

// // REGISTER
// const registerUser = async (mobile_number) => {
//   console.log("Registering user with mobile:", mobile_number);  
//   const existingUser = await userModel.findByMobile(mobile_number);

//   if (existingUser) {
//     return { success: false, message: "User already registered. Please log in." };
//   }

//   await userModel.createUserIfNotExist(mobile_number);

//   console.log("Sending registration OTP to:", mobile_number);
// try {
//   await sendOtpSMS(mobile_number);
// } catch (err) {
//   return {
//     success: false,
//     message: "Failed to send OTP. Try again.",
//   };
// }
//   return {
//     success: true,
//     mode: "register",
//     message: "OTP sent successfully for registration",
//   };
// };

// // LOGIN OTP
// const sendLoginOtp = async (mobile_number) => {
//   console.log("Sending login OTP to:", mobile_number);
//   const user = await userModel.findByMobile(mobile_number);

//   if (!user) {
//     return { success: false, message: "User not found. Please register first." };
//   }

//   try {
//     await sendOtpSMS(mobile_number);
//   } catch (err) {
//     return {
//       success: false,
//       message: "Failed to send OTP. Try again.",
//     };
//   }

//   return {
//     success: true,
//     mode: "login",
//     message: "OTP sent successfully for login",
//   };
// };

// // VERIFY OTP (MSG91)
// const verifyOtp = async (mobile_number, otp) => {
//   console.log(`Verifying OTP for ${mobile_number}: ${otp}`);
//   const response = await verifyOtpSMS(mobile_number, otp);

//  if (!response || response.type !== "success") {
//   return { success: false, message: "Invalid OTP" };
// }

//   const user = await userModel.findByMobile(mobile_number);
//   const token = generateToken(user);

//   return {
//     success: true,
//     token,
//     user,
//     next_step: user.profile_completed ? "home" : "complete_profile",
//   };
// };

// // RESEND OTP
// const resendOtp = async (mobile_number) => {
//   console.log("Resending OTP to:", mobile_number);
// try {
//   await sendOtpSMS(mobile_number);
// } catch (err) {
//   return {
//     success: false,
//     message: "Failed to send OTP. Try again.",
//   };
// }
//   return {
//     success: true,
//     message: "OTP resent successfully",
//   };
// };

// module.exports = {
//   registerUser,
//   sendLoginOtp,
//   verifyOtp,
//   resendOtp,
// };