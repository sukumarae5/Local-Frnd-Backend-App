
export const checkAdmin=(req,res,next)=>{
    const adminKey=req.headers["admin-key"]
    if(!adminKey || adminKey!==process.env.ADMIN_JWT_SECRET){
        return res.status(403).json({success:false, message:"Forbidden: Invalid Admin Key"})
    }
    if(adminkey === process.env.ADMIN_JWT_SECRET){
        req.isAdmin = true; 
    }
    else{
        req.isAdmin = false;
    }
    next()
}