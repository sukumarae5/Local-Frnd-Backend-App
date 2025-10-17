const mysql=require("mysql2/promise")
require("dotenv").config("../.env")
const fs=require("fs")

const connection=mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DATABASE,
    ssl:{
     ca:fs.readFileSync(process.env.CA) 
    },
    waitForConnections:true,
    connectionLimit:0,
    queueLimit:0
})

const conn = async()=>{
    try {
        const con= await connection.getConnection()
        // console.log(con)
        console.log("database connected successfully")
        con.release()
    } catch (error)
    {
        console.log(error)
    }
}

conn()
module.exports=connection