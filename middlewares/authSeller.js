import jwt from 'jsonwebtoken';


const authSeller = async (req, res, next) => {
    // store cookies in token variable
    const { sellerToken } = req.cookies;

    if (!sellerToken) {
        return res.json({ success: false, message: 'Not Authorized' });
    }

    // token cookies available using try and catch
    try {
        const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET);
        if (tokenDecode.email === process.env.SELLER_EMAIL) {
            next();
        } else {
            return res.json({ success: false, message: 'Not Authorized' });
        }

    } catch (error) {
        res.json({ success: false, message: error.message });
    }

};

export default authSeller;