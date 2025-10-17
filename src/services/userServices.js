const jwt=require('jsonwebtoken')
const userModel=require('../models/user')

const generateOtp =()=>{
    return Math.floor(1000 + Math.random()*900000).toString()
}

const sendOtp= async (mobile_number) => {
    const otp=generateOtp()
    await userModel.createOrUpdateOtp(mobile_number, otp)
    console.log(`OTP for ${mobile_number} is ${otp}`)
    //Here we write the itegration for example twilio
    return {success:true, message:"OTP Sent Successfully"}
}

const verifyOtp = async (mobile_number, otp) => {
    const user=await userModel.findByMobileAndOtp(mobile_number, otp);
    console.log(user.mobile_number, user.otp)
    if(mobile_number!==user.mobile_number ){
        return {success:false, message:"Mobile number does not match"}
    }
    if (otp!==user.otp) {
        return { success: false, message: "Invalid OTP click on resend OTP" };
    }
    if(!user){
        return {success:false, message:"Invalid number or otp"}
    }
    
    // const token = jwt.sign({ id: user.id, mobile_number: user.mobile_number }, process.env.JWT_SECRET, {
    // expiresIn: "1hr",
    // });
    await userModel.clearOtp(mobile_number)
    return {success:true, message:"OTP Verified Successfully" }
    // return{token:token}
}

const updateProfile= async (mobile_number, userData) => {
    const user= await userModel.findByMobile(mobile_number)
    if(!user){
        throw new Error("User not found")
    }    
    const result= await userModel.updateProfile(mobile_number,userData)
    if(result.affectedRows===0){
        throw new Error("No fileds updated")
    }
    return {success:true, message:"Profile updated successfully"}
}
module.exports={
    sendOtp,
    verifyOtp,
    updateProfile
}