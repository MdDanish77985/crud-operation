const express = require("express");                   // Import Express
const { signup, signIn, forgotPassword, resetPassword, updateUser, deleteUser,verifyOtp} = require("../controllers/authController");
const authMiddleware = require("../middleware/authmiddleware");
const upload = require("../middleware/upload");

const router = express.Router();                      // Create router

router.post("/signup",upload.single("photo"), signup);                       // Signup route
router.post("/signIn", signIn);                       // Signin route
router.post("/forgot-password", forgotPassword);      // Forgot password (send OTP)
router.post("/reset-password", resetPassword);        // Reset password (verify OTP)
router.put("/update-user", authMiddleware, updateUser); // Update email/password
router.delete("/delete-user",authMiddleware,deleteUser) //Delete user
router.post("/verify-otp", verifyOtp);                   //otp sverification
// Route to verify authentication - checks if the JWT is valid
// router.get("/protected", authMiddleware, (req, res) => res.send("Protected route accessed")); //just for debugging  that authentication works.
// Defines a GET route, checks JWT with authMiddleware, and sends a success message if token is valid
// 👉 To create a route that only users with a valid token can access.
// 👉 If you don’t have a token or your token is invalid, you can’t access this route.
module.exports = router;                              // Export router
