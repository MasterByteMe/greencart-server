import express from 'express';
import { getUserOrders, placedOrderCOD, getAllOrders, placedOrderStripe } from '../controllers/orderController.js';
import authUser from "../middlewares/authUser.js"
import authSeller from "../middlewares/authSeller.js";

const orderRouter = express.Router();


orderRouter.post('/cod', authUser, placedOrderCOD);  // 👈 Only logged-in users can place orders
orderRouter.get('/user', authUser, getUserOrders);   // 👈 Only the logged-in user can view *their own* orders
orderRouter.get('/seller', authSeller, getAllOrders); // 👈 Only sellers/admins can view *all* orders
orderRouter.post('/stripe', authUser, placedOrderStripe);


export default orderRouter;