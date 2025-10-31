import User from "../models/User.js";


// Update User CartData: api/cart/update

export const updateCart = async (req, res) => {
    try {
        // Extract userId and cartItems from the request body sent by the client
        const userId = req.userId;
        const { cartItems } = req.body;

        // Find the user by ID and update their cart data in the database
        await User.findByIdAndUpdate(userId, { cartItems });

        // Send a success response if the cart update is successful
        res.json({ success: true, message: "Cart Updated" });
    } catch (error) {
        // Log the error message for debugging
        console.log(error.message);

        // Send an error response if something goes wrong
        res.json({ success: false, message: error.message });
    }
}

