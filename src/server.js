const express = require('express');
const cors=require("cors")
const db=require("./config/db")
const multer=require('multer')
const upload=multer({dest:'uploads/'})

const authRoutes = require("./routes/authRoutes")
const userRoutes= require('./routes/userRoutes')
const photoRoutes=require('./routes/photoRoutes')


const app=express();

app.use(cors())
app.use(express.json());

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
app.use("/uploads", express.static("uploads"));



const port=8082
app.listen(port,"0.0.0.0",()=>{
    console.log("server is running")
    console.log("server is running on port", port)
})
 