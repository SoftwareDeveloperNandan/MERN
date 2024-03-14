import app from "./app.js";
import connectDB from "./db/index.js";
import dotenv from 'dotenv';

dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log(`Connection failed :`, error);
        throw error;
    })

    app.listen(process.env.PORT || 5000, () => {
        console.log("Server is running at port :", `${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("Database Conection failed!!!", error);
})


/*
import express from "express";
const app = express()
( async () => {

    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error", (error) => {
        console.log("App is not talk to DATABASE.");
        throw error;
       })

       app.listen(process.env.PORT, () => {
        console.log("Port is started in", `${process.env.PORT}`);
       })
    } catch (error) {
        console.log("ERROR", error);
    }
})()
*/