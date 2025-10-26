// import packages
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import connectCloudinary from './configs/cloudinary.js';
import 'dotenv/config';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';



// app for express
const app = express();

//run the server at port 4000
const port = process.env.PORT || 4000;

// connect database from db.js
await connectDB();

// connect cloudinary from cloudinary.js
await connectCloudinary();

//URL for frontend - Allow multiple origins
const allowedOrigins = ['http://localhost:5173/'];


// Middleware Configuration
app.use(express.json()); //all the server request coming to this server will be passed
app.use(cookieParser());

// Allow your frontend origin and credentials (cookies, tokens)
app.use(cors({
    origin: 'http://localhost:5173',  // frontend URL
    credentials: true,                // allow cookies and authorization headers
}));


// API route
app.get('/', (req, res) => res.send("API is working"));
app.use('/api/user', userRouter); //API userRouter
app.use('/api/seller', sellerRouter); //API sellerRouter
app.use('/api/product', productRouter); //API productRouter
app.use('/api/cart', cartRouter); //API cartRouter
app.use('/api/address', addressRouter); //API addressRouter
app.use('/api/order', orderRouter); //API orderRouter


// start the app
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});
