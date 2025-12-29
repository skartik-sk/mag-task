import jwt from 'jsonwebtoken';
export const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, userId: decoded.id, email: decoded.email };
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
export const authenticate = auth;
