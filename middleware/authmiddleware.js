const jwt = require("jsonwebtoken");  // Import JWT for token verification
require("dotenv").config();           // Load .env variables

// Middleware function to verify JWT tokens
const authMiddleware = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];  // Extract token from header

    if (!token) return res.status(401).json({ message: "Access denied. Token required." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify token using secret
        req.user = decoded;                                         // Attach user info to request
        next();                                                     // Pass control to next middleware/route
    } catch (err) {
        res.status(403).json({ message: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;  // Export the middleware
