import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";

const app = express()

dotenv.config();
mongoose.connect(process.env.MONGODB_URL).then(()=>{
    console.log("Database connected successfully.")
}).catch(err=>console.log("Database connection failed",err));

app.use(bodyParser.json({limit:"50mb"}));
app.use(bodyParser.urlencoded({extended:false, limit:"50mb"}));

// Use CORS middleware
app.use(cors({
    origin: '*',
}));


// Import Routes
import userRoute from "./routes/userRoute.js";
import candidateRoute from "./routes/candidateRoute.js";

//Use Routes
app.use("/user",userRoute);
app.use("/candidate",candidateRoute);


const PORT = 3000;

app.listen(PORT,()=>{
    console.log(`Server is listening on PORT ${PORT}`)
})

