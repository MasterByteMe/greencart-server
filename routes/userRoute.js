import express from 'express';
import { isAuth, login, logout, register } from '../controllers/userController.js';
import authUser from "../middlewares/authUser.js"

const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.get('/is-auth', authUser, isAuth); //usAuth will provide user data whenever the user is logged in
userRouter.get('/logout', authUser, logout);

export default userRouter;