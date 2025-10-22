import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    // store cookies in token variable
    const { token } = req.cookies;

    // token cookies not available
    if (!token) {
        return res.json({ success: false, message: 'Not Authorized' });
    }
    // token cookies available using try and catch
    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        if (tokenDecode.id) {
            req.userId = tokenDecode.id;
        } else {
            return res.json({ success: false, message: 'Not Authorized' });
        }
        next();

    } catch (error) {
        res.json({ success: false, message: error.message });
    }

};

export default authUser; 