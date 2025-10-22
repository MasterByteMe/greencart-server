import mongoose from "mongoose";


const userSchema = new mongoose.Schema({

    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartItems: { type: Object, default: {} },
}, { minimize: false });

// if the user model is available then it will be use, else will create new user schema
const User = mongoose.models.user || mongoose.model('user', userSchema);


export default User;