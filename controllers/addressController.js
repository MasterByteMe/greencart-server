// Import the Address model to interact with the addresses collection in MongoDB
import Address from "../models/Address.js";


// Add Address: /api/address/add
export const addAddress = async (req, res) => {
    try {
        // ✅ Get userId from middleware instead of body
        const userId = req.userId;
        const { address } = req.body;

        // Check if address or userId is missing
        if (!address || !userId) {
            // Send an error response if required data is not provided
            return res.json({ success: false, message: "Missing address or user ID" });
        }

        // Save the address in DB with the user's ID
        await Address.create({ ...address, userId });

        // Send a success response after the address is saved
        res.json({ success: true, message: "Address added successfully" });

    } catch (error) {
        // Log the error message in the console for debugging
        console.log(error.message);

        // Send an error response if something goes wrong during the process
        res.json({ success: false, message: error.message });
    }
};


// Get Address: /api/address/get
export const getAddress = async (req, res) => {
    try {
        const userId = req.userId; // get user ID from the auth middleware

        // Check if userId is missing
        if (!userId) {
            // Send an error response if userId is not provided
            return res.json({ success: false, message: "User not authorized" });
        }

        // Find all address documents in the database that belong to the given user
        const addresses = await Address.find({ userId });

        // Send a success response with the list of addresses
        res.json({ success: true, addresses });

    } catch (error) {
        // Log the error message in the console for debugging
        console.log(error.message);

        // Send an error response if something goes wrong during the process
        res.json({ success: false, message: error.message });
    }
};
