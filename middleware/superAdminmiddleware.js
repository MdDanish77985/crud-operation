const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const superadminMiddleware = async (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];  
    console.log(token);
    
    if (!token) return res.status(401).json({ message: "❌ Token required." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded,"........");
    const superadminRole =await User.findOne({_id:decoded.id});
    console.log(superadminRole,"..........");
    
        req.user = decoded;

        // 🔍 **Check if user is Superadmin**
        if (superadminRole.userRoleId !== 1) {
            return res.status(403).json({ message: "❌ Access denied. Only Superadmins can create Admins." });
        }

        next();  // ✅ Proceed karega agar Superadmin hai
    } catch (err) {
        res.status(403).json({ message: "❌ Invalid or expired token." });
    }
};

module.exports = superadminMiddleware ; // Export the middleware