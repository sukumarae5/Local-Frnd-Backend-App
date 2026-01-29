const express = require('express');
const cors=require("cors")
const multer=require('multer')
const upload=multer({dest:'uploads/'})
const socketIO = require('socket.io');
const { init } = require('./socket');


const authRoutes = require("./routes/authRoutes")
const userRoutes= require('./routes/userRoutes')
const photoRoutes=require('./routes/photoRoutes')
const profileRoutes=require('./routes/profileRoutes')
const callRoutes= require('./routes/callRoutes')
const languageRoutes= require('./routes/languageRoutes')
const avatarRoutes = require("./routes/avatarRoutes");
const callHistoryRoutes = require("./routes/callHistoryRoutes");
const friendRoutes = require("./routes/friendRoutes");
const locationRoutes = require("./routes/locationRoutes");
const interestRoutes = require("./routes/interestRoutes");
const userinterestRoutes = require("./routes/userinterestRoutes");
const lifestyleRoutes = require("./routes/lifestyleRoutes");
const lifestylecategoryRoutes = require("./routes/lifestylecategoryRoutes");
const userlifestyleRoutes = require("./routes/userlifestyleRoutes");

const app=express();

app.use(cors())
 
app.use(express.json({ limit: "1mb" }));           // for JSON
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get("/api/user",(req, res)=>{
    console.log("user route")
    res.send("user route")
})


// app.post("/api/singlephoto", upload.single('photo'),(req,res)=>{
//     console.log("photo uploaded")
//     console.log(req.file.originalname)
//     // res.send("photo uploaded")
//     res.json({success:true, message:"photo uploaded successfully"})
// })
// app.post("/api/multiplephotos", upload.array("photo",5),(req,res)=>{
//    console.log("multiple photos uploaded")
//    res.json({success:true, message:"multiple photos uploaded successfully", files:req.files})
// })

// const uploadMiddleware=upload.fields([{name:"avatar", maxCount:1},{name:"photos", maxCount:5}])
// app.post("/api/photosavatarandphoto",uploadMiddleware,(req, res)=>{
//  console.log("fields uploaded", req.files)
//  res.json({success:true, message:"fields uploaded successfully", files:req.files})
// })


app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/photo', photoRoutes)
app.use('/api/userprofile',profileRoutes)
app.use('/api/call', callRoutes)
app.use('/api/language', languageRoutes)
app.use("/api/avatars", avatarRoutes);
app.use("/api/calls", callHistoryRoutes);
app.use("/api/friend", friendRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/interest", interestRoutes);
app.use("/api/userinterest", userinterestRoutes);
app.use('/api/lifestyle',lifestyleRoutes);
app.use('/api/lifestylecategory',lifestylecategoryRoutes);
app.use('/api/userlifestyle', userlifestyleRoutes);


app.use("/uploads", express.static("uploads"));


app.use(express.json({ limit: "50mb" }));

const port=8082
// app.listen(port,"0.0.0.0",()=>{
//     console.log("server is running")
//     console.log("server is running on port", port)
// })

const server= app.listen(port,"0.0.0.0",()=>{
    console.log("server is running on port", port)
})
    
const io = socketIO(server, {
    cors: {
      origin: "*",  
             methods: ["GET", "POST"],
                  
    },
});     

init(io)
module.exports = { app, server, io };