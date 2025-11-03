import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  console.log("Authenticating user...", req.headers);
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add decoded data to request
    next(); // Proceed to controller
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};
