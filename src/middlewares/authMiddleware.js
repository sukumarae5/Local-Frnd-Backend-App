import jwt from "jsonwebtoken";
import * as userModel from "../models/user.js";

export const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing"
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token missing"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ FIX HERE
    const user = await userModel.findById(decoded.user_id);
// console.log("Authenticated user:", user);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    req.user = {
      user_id: user.user_id,
      gender: user.gender
    };

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};
