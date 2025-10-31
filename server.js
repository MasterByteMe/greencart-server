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
import { stripeWebhooks } from './controllers/orderController.js';

const app = express();
const port = process.env.PORT || 4000;

// ✅ Connect DB and Cloudinary
await connectDB();
await connectCloudinary();

// ✅ Stripe webhook must be BEFORE express.json()
app.post(
    '/api/order/stripe-webhook',
    express.raw({ type: 'application/json' }),
    stripeWebhooks
);

// ✅ Regular middleware comes AFTER the webhook
app.use(express.json());
app.use(cookieParser());

// ✅ Configure CORS dynamically based on environment
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173', // frontend local or deployed
];

app.use(
    cors({
        origin: [
            'http://localhost:5173',                 // for local development
            'https://greencart-frontend.vercel.app'  // your upcoming Vercel frontend URL
        ],
        credentials: true,
    })
);


// ✅ Test route
app.get('/', (req, res) => res.send('API is working ✅'));

// ✅ Register all routes
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// ✅ Start the server
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port} in ${process.env.NODE_ENV} mode`);
});
