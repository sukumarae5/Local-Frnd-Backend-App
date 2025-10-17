const express = require('express');
const cors=require("cors")
const db=require("./config/db")

const authRoutes = require("./routes/authRoutes")
const userRoutes= require('./routes/userRoutes')


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

app.use('/api/otp', authRoutes)
app.use('/api/user', userRoutes)



const port=8082
app.listen(port,"0.0.0.0",()=>{
    console.log("server is running")
    console.log("server is running on port", port)
})
