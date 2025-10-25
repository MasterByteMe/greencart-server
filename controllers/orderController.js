import Product from "../models/Product.js";
import Order from "../models/Order.js";


// Place COD Order: /api/order/cod
export const placedOrderCOD = async (req, res) => {
    try {
        // Get user ID, items in cart, and delivery address from the request body
        const { userId, items, address } = req.body;

        // Check if address or items are missing, return an error if so
        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid Data" });
        }

        // Initialize total amount to 0
        let amount = 0;

        // Loop through each item to calculate the total order amount
        for (const item of items) {
            // Find each product in the database by its ID
            const product = await Product.findById(item.product);

            // Multiply product price by quantity and add it to total amount
            amount += product.offerPrice * item.quantity;
        }

        // Add 2% tax charge to the total amount
        amount += Math.floor(amount * 0.02);

        // Create a new order in the database with the order details
        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD", // Set payment type to Cash On Delivery
        });

        // Send success response if order is created successfully
        return res.json({ success: true, message: "Order Placed Successfully" });
    } catch (error) {
        // Send error response if something goes wrong
        res.json({ success: false, message: error.message });
    }
};



// Get Orders by User ID: /api/order/user
export const getUserOrders = async (req, res) => {
    try {
        // Get the user ID from the request body
        const { userId } = req.body;

        // Find all orders belonging to the user that are either COD or paid
        const orders = await Order.find({
            userId,
            $or: [{ paymentType: "COD" }, { isPaid: true }],
        })
            // Populate item and address details from referenced collections
            .populate("items.product address")
            // Sort orders from newest to oldest using createdAt field
            .sort({ createdAt: -1 });

        // Send a success response with the list of user orders
        return res.json({ success: true, orders });
    } catch (error) {
        // Send error response if something goes wrong
        res.json({ success: false, message: error.message });
    }
};



// Get All Orders (for Seller/Admin): /api/order/seller
export const getAllOrders = async (req, res) => {
    try {
        // Find all orders that are either COD or paid
        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }],
        })
            // Populate item and address data for each order
            .populate("items.product address")
            // Sort orders by newest first
            .sort({ createdAt: -1 });

        // Send a success response with all orders
        return res.json({ success: true, orders });
    } catch (error) {
        // Send error response if something goes wrong
        res.json({ success: false, message: error.message });
    }
};
