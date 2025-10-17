const userSevice = require('../services/userServices')

exports.sendOtp=async (req, res) => {
    
    try {
        const {mobile_number}=req.body
        console.log(req.body)
        if(!mobile_number){
            return res.status(400).json({success:false, message:"Mobile Number is required"})
        }
        const result= await userSevice.sendOtp(mobile_number)
        res.json(result)
    } catch (error) {
        res.status(500).json({success:false, message:"Internal Server Error", error:error.message})
    }
}


exports.verifyOtp= async (req, res) => {
    try {
        const {mobile_number, otp}=req.body
        if(!mobile_number || !otp){
            return res.status(400).json({success:false, message:"Mobilenumber and otp are required"})
        }
        const result= await userSevice.verifyOtp(mobile_number, otp)
        if (!result.success) {
            return res.status(400).json({success: false, message: result.message});
        }
        res.json({success:true, message:result.message})
    } catch (error) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message})
    }
}

