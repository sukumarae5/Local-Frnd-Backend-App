import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  console.log(user);
  try {
    const payload = {
      user_id: user.user_id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return token;
  } catch (err) {
    console.error("Error generating token:", err);
    return null;
  }
};
