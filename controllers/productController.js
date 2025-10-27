import { v2 as cloudinary } from "cloudinary";
import Product from '../models/Product.js';

//Add Product: /api/product/add
export const addProduct = async (req, res) => {
    try {
        // Get the product data from the request body (sent as a JSON string)
        let productData = JSON.parse(req.body.productData);

        // Get all the image files uploaded by the user
        const images = req.files

        // Upload all images to Cloudinary and store their URLs
        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                // Upload each image to Cloudinary as an image resource
                let result = await cloudinary.uploader.upload(item.path, {
                    resource_type: 'image'
                });
                // Return the URL of the uploaded image
                return result.secure_url;
            })
        )
        // Create a new product document in the database with product data and uploaded image URLs
        await Product.create({ ...productData, image: imagesUrl });

        // Send a success response back to the frontend
        return res.json({ success: true, message: "Product Added" });

    } catch (error) {
        // Log the error message for debugging
        console.log(error.message);
        // Send an error response if something goes wrong
        res.json({ success: false, message: error.message })
    }
};



// Get Product: /api/product/list
export const productList = async (req, res) => {
    try {
        // Retrieve all product documents from the database
        const products = await Product.find();

        // Send a success response with the list of products
        return res.json({ success: true, products });
    } catch (error) {
        // Log the error message for debugging
        console.log(error.message);
        // Send an error response if something goes wrong
        res.json({ success: false, message: error.message })
    }
}



// Get single Product: /api/product/id
export const productById = async (req, res) => {
    try {
        // Get the product ID from the request body
        const { id } = req.body;

        // Find the product in the database using the provided ID
        const product = await Product.findById(id);

        // Send a success response with the product data
        res.json({ success: true, product });
    } catch (error) {
        // Log the error message for debugging
        console.log(error.message);

        // Send an error response if something goes wrong
        res.json({ success: false, message: error.message });
    }
};



// Change Product inStock: /api/product/stock
export const changeStock = async (req, res) => {
    try {
        // Get the product ID and updated stock value (true/false) from the request body
        const { id, inStock } = req.body;

        // Find the product by ID and update its stock status in the database
        await Product.findByIdAndUpdate(id, { inStock });

        // Send a success response after the stock status is updated
        res.json({ success: true, message: "Stock Updated" });
    } catch (error) {
        // Log the error message for debugging
        console.log(error.message);

        // Send an error response if something goes wrong
        res.json({ success: false, message: error.message });
    }
};

