// import packages
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';
import userRouter from './routes/userRoute.js';


// app for express
const app = express();

//run the server at port 4000
const port = process.env.PORT || 4000;

// connect database from db.js
await connectDB();

//URL for frontend - Allow multiple origins
const allowedOrigins = ['http://localhost:5173/'];


// Middleware Configuration
app.use(express.json()); //all the server request coming to this server will be passed
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true })); //object - origin allowed to acces the backend

// API route
app.get('/', (req, res) => res.send("API is working"));
app.use('/api/user', userRouter); //API userRouter


// start the app
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});
