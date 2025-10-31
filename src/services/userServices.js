// const userModel = require("../models/user");

// // Get all users
// const getAllUsers = async () => {
//   const users = await userModel.getAllUsers();
//   return { success: true, users };
// };

// // Get user by ID
// const getProfileById = async (id) => {
//   const user = await userModel.findById(id);
//   if (!user) return { success: false, message: "User not found" };
//   return { success: true, user };
// };  


// const updateProfile = async (user_id, userData) => {
    
//   const user = await userModel.findById(user_id);
//   if (!user) throw new Error("User not found");


//   const requiredFields = ["name", "age", "gender", "location_lat", "location_log"];
//  const missingFields = requiredFields.filter(
//     (field) => !userData[field] || userData[field].toString().trim() === ""
//   );
//    if (missingFields.length > 0) {
//     throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
//   }
//   const allowedGenders = ["Male", "Female"];
//   if (!allowedGenders.includes(userData.gender)) {
//     throw new Error(`Invalid gender value. Allowed: ${allowedGenders.join(", ")}`);
//   }
//   if (isNaN(userData.age)) throw new Error("Age must be a number");

//   userData.profile_status = "verified";
//   userData.status = "active";
//   userData.updates_at = new Date();

//   const result = await userModel.updateProfile(user_id, userData);
//   if (result.affectedRows === 0) throw new Error("No fields updated");

//   return { success: true, message: "Profile updated successfully" };
// };
 
// const deleteUserId=async (user_id) => {
//   const user=await userModel.findById(user_id)
//   if(!user) throw new Error("user not found")

//     const result= await userModel.deleteUserId(user_id)
//     if(result.affectedRows===0) throw new Error("user not deleted")
//     return {success:true, message:"user deleted successfully"}
// }

// module.exports = {
//   getAllUsers,
//   getProfileById,
//   updateProfile,
//   deleteUserId
// };
