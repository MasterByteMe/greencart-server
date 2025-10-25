// Import the Address model to interact with the addresses collection in MongoDB
import Address from "../models/Address.js";


// Add Address: /api/address/add
export const addAddress = async (req, res) => {
    try {
        // Extract address details and userId from the request body
        const { address, userId } = req.body;

        // Check if address or userId is missing
        if (!address || !userId) {
            // Send an error response if required data is not provided
            return res.json({ success: false, message: "Missing address or user ID" });
        }

        // Create a new address document in the database, linked to the user
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
        // Extract userId from the request body
        const { userId } = req.body;

        // Check if userId is missing
        if (!userId) {
            // Send an error response if userId is not provided
            return res.json({ success: false, message: "User ID is required" });
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
