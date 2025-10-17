const userService= require('../services/userServices')

exports.updateProfile = async (req, res) => {
    try {
        const {mobile_number, ...userData}=req.body;
        console.log("req data", req.body)
        console.log("Updating profile for mobile number:", mobile_number);

        const result= await userService.updateProfile(mobile_number, userData);
        res.status(200).json(result)

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
