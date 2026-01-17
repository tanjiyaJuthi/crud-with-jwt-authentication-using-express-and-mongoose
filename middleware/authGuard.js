import jwt from 'jsonwebtoken';

const authGuard = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401)
                .json({
                message: 'Authorization token missing'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        
        // attach user info for further use
        req.user = {
            userId: decoded.userId,
            username: decoded.username
        };

        next();
    } catch (error) {
        console.log(error);
        return res.status(401)
            .json({
                message: 'Sorry!'
            });
    }
};

export default authGuard;