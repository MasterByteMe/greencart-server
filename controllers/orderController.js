import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import stripe from 'stripe';


// Place COD Order: /api/order/cod
export const placedOrderCOD = async (req, res) => {
    try {
        // Get user ID, items in cart, and delivery address from the request body
        const { userId, items, address } = req.body;

        // Validate required data
        if (!userId || !address || !Array.isArray(items) || items.length === 0) {
            return res.json({ success: false, message: "Missing required fields" });
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


// Place Order Strip: /api/order/stripe
// Place Order Stripe: /api/order/stripe
export const placedOrderStripe = async (req, res) => {
    try {
        const { userId, items, address } = req.body;
        const { origin } = req.headers;

        if (!userId || !address || !Array.isArray(items) || items.length === 0) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        let productData = [];
        let totalAmount = 0;

        // Calculate total amount
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) continue;

            const subtotal = product.offerPrice * item.quantity;
            totalAmount += subtotal;

            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            });
        }

        // Add 2% tax (on total only)
        const tax = totalAmount * 0.02;
        const grandTotal = Math.round(totalAmount + tax); // round to nearest whole

        // Create order in MongoDB
        const order = await Order.create({
            userId,
            items,
            amount: grandTotal,
            address,
            paymentType: "Online",
        });

        // Stripe initialization
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        // Stripe line items (no tax per item)
        const line_items = [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "Order Total (with 2% Tax)",
                    },
                    unit_amount: grandTotal * 100, // Stripe requires amount in cents
                },
                quantity: 1,
            },
        ];

        // Create Stripe Checkout Session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            },
        });

        return res.json({ success: true, url: session.url });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};





// Stipe Wbhooks to Verify Payments Action: /stripe
export const stripeWebhooks = async (request, response) => {
    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const sig = request.headers["stripe-signature"];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        console.log("✅ Webhook received:", event.type);
    } catch (error) {
        console.error("❌ Webhook signature verification failed:", error.message);
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                console.log("💰 Payment succeeded event detected");

                const paymentIntent = event.data.object;
                const paymentIntentId = paymentIntent.id;

                // Getting Session Metadata
                const session = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntentId,
                });

                if (!session.data.length) {
                    console.warn("⚠️ No session found for payment intent:", paymentIntentId);
                    break;
                }

                const { orderId, userId } = session.data[0].metadata;

                console.log(`✅ Updating order ${orderId} to isPaid: true for user ${userId}`);

                // Mark Payment as Paid
                await Order.findByIdAndUpdate(orderId, { isPaid: true });

                // Clear user cart
                await User.findByIdAndUpdate(userId, { cartItems: {} });
                break;
            }

            case "payment_intent.payment_failed": {
                console.log("❌ Payment failed event detected");

                const paymentIntent = event.data.object;
                const paymentIntentId = paymentIntent.id;

                const session = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntentId,
                });

                if (session.data.length) {
                    const { orderId } = session.data[0].metadata;
                    console.log(`🗑️ Deleting failed order: ${orderId}`);
                    await Order.findByIdAndDelete(orderId);
                }
                break;
            }

            default:
                console.warn(`⚠️ Unhandled event type: ${event.type}`);
                break;
        }

        response.json({ received: true });
    } catch (error) {
        console.error("💥 Error handling webhook event:", error.message);
        response.status(500).send("Internal Server Error");
    }
};


// Get Orders by User ID: /api/order/user
export const getUserOrders = async (req, res) => {
    try {
        // ✅ Get the user ID from the query (since this is a GET request)
        const { userId } = req.query;

        if (!userId) {
            return res.json({ success: false, message: "User ID is required" });
        }

        // Find all orders belonging to the user that are either COD or paid
        const orders = await Order.find({
            userId,
            $or: [{ paymentType: "COD" }, { isPaid: true }],
        })
            // ✅ Populate referenced product and address documents
            .populate("items.product")
            .populate("address")
            // Sort newest to oldest
            .sort({ createdAt: -1 });

        // Send success response
        return res.json({ success: true, orders });

    } catch (error) {
        // Handle errors
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
