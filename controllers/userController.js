import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';


//Register User: /api/user/register
export const register = async (req, res) => {
    try {
        // user not available
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing Details" })
        }
        // fine user email acct and save it to existingUser variable
        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.json({ success: false, message: "User already exists" })
        }
        // encryprt password using bcryptjs
        const hashedPassword = await bcrypt.hash(password, 10)
        // create the user model along with email,name and encrypt password
        const user = await User.create({ email, name, password: hashedPassword })

        // use token to send on res using jsonwebtoken, add unique id, JWT_SECRET from .env, and expiration time with 7 days
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        // send the token to response with name, value and other configuration 
        res.cookie('token', token, {
            httpOnly: true, //Prevent JavaScript to access the cookie
            secure: process.env.NODE_ENV === 'production', //Use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', //CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiration time
        })

        // send res.cookie to frontend via return
        return res.json({ success: true, user: { email: user.email, name: user.name } })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
};


// Login User: /api/user/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // email and password not available
        if (!email || !password) {
            return res.json({ success: false, message: "Email and password are required" });
        }
        // find email and store it to user variable
        const user = await User.findOne({ email });

        // user not available from the database
        if (!user) {
            return res.json({ success: false, message: "Invalid Email or password" });
        }

        // bcrypt will compare the password and user.password, if its match isMatch will be true, otherwise false
        const isMatch = await bcrypt.compare(password, user.password)

        // isMatch is false
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Email or password" });
        }

        // if isMatch is true
        // use token to send on res using jsonwebtoken, add unique id, JWT_SECRET from .env, and expiration time with 7 days
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        // send the token to response with name, value and other configuration 
        res.cookie('token', token, {
            httpOnly: true, //Prevent JavaScript to access the cookie
            secure: process.env.NODE_ENV === 'production', //Use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', //CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiration time
        })

        // send res.cookie to frontend via return
        return res.json({ success: true, user: { email: user.email, name: user.name } })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
};


// Check Auth:/api/user/is-auth
export const isAuth = async (req, res) => {
    try {
        const userId = req.userId; //get userId from req
        // find user from the database then remove the password data
        const user = await User.findById(userId).select("-password");
        return res.json({ success: true, user })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}



// Logout User: /api/user/logout
export const logout = async (req, res) => {
    try {
        // clear the cookie that saved to variable token to logout the user
        res.clearCookie("token", {
            httpOnly: true, //Prevent JavaScript to access the cookie
            secure: process.env.NODE_ENV === 'production', //Use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', //CSRF protection
        })
        return res.json({ success: true, message: "Logged Out Successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
};