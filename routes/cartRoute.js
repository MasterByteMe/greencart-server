import express from 'express';
import authUser from "../middlewares/authUser.js";
import { updateCart } from '../controllers/cartController.js';

// Create an Express router instance
const cartRouter = express.Router();

// Define the /update route with user authentication middleware
cartRouter.post('/update', authUser, updateCart);

// Export the router to be used in server.js
export default cartRouter;
