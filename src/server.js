const express = require('express');
const db=require("../src/config/db")
const app=express();
const port=500
app.use(express.json());
app.listen(port,()=>{
    console.log("serever is running")
    console.log("i am clone successfuly")
    console.log("i am lokesh  clone successfully ")
})
