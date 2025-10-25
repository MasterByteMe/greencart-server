import express from 'express';
import { getUserOrders, placedOrderCOD, getAllOrders } from '../controllers/orderController.js';
import authUser from "../middlewares/authUser.js"


const orderRouter = express.Router();


orderRouter.post('/cod', authUser, placedOrderCOD);
orderRouter.post('/user', authUser, getUserOrders);
orderRouter.post('/seller', authUser, getAllOrders);


export default orderRouter;