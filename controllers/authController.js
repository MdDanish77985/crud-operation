const User = require("../models/userModel");    // Import User model
const bcrypt = require("bcrypt");               // For hashing passwords
const jwt = require("jsonwebtoken")             // JWT for token generation
const sendEmail = require("../utils/sendEmail");// Email utility for sending OTP
// const crypto = require("crypto");               // Generates random OTP
const {initializeSuperAdmin} = require("./superAdmin"); // Import function to create superadmin
const Role = require("../models/roleModel"); // Import role model

//Route handle for for creating a superAdmin
const createSuperAdmin = async (req, res) => {
    try {
        const response = await initializeSuperAdmin(); // Call function

        if (response.success) {
            return res.status(201).json({ message: "✅ Superadmin created successfully"});
        } else {
            return res.status(400).json({ message: "Superadmin already exists"});
        }
    } catch (error) {
        return res.status(500).json({ message: "❌ Internal Server Error", error: error.message });
    }
};
const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // ✅ Check if Admin already exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        // ✅ Password Hashing
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Admin Create
        const newAdmin = new User({ name, email, password: hashedPassword ,userRoleId:2});
        await newAdmin.save();

        res.status(201).json({ message: "Admin created successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}
// ✅ Forgot Password Controller
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;  // Extract email from request

        // 🔍 Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 🔑 Generate random 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const hashedotp = await bcrypt.hash(otp, 10);  // Hash OTP before storing

        // 🕒 Set OTP and expiration (5 minutes from now)
        user.otp = hashedotp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;

        // 💾 Save OTP to user's record
        await user.save();

        // 📧 Send OTP via email
        await sendEmail(
            email,                           // To user's email
            "Password Reset OTP",            // Subject
            `Your OTP is: ${otp}. It expires in 5 minutes.` // Body
        );

        res.status(200).json({ message: "OTP sent to email" });
    } catch (error) {
        res.status(500).json({ message: "Error in forgot password", error });
    }
};

// ✅ Reset Password with OTP Verification
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;  // Extract data from request

        // 🔍 Step 1: Verify OTP
        const user = await User.findOne({  // ✅ Added back missing assignment
            email,
            otp: Number(otp),  // Ensure correct data type
            otpExpires: { $gt: Date.now() } // Check if OTP is valid and not expired
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid OTP or expired" });
        }

        // ✅ OTP verified successfully
        console.log("✅ OTP verified successfully");

        // 🔒 Step 2: Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 🔄 Step 3: Update password & clear OTP
        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({
            message: "OTP verified and password reset successful"
        });

    } catch (error) {
        res.status(500).json({ message: "Error resetting password", error });
    }
};

// ✅ Signup Controller
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body; // Extract data from the request
        const photo = req.file ? req.file.filename : null; // 📸 Photo ka naam store karenge

        // 🔍 Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // 📝 Create new user
        const hashPassword = await bcrypt.hash(password, 10)
        //for otp
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
        const hashedOtp = await bcrypt.hash(otp, 10);
        const newUser = new User({
            name, email,
            password: hashPassword, photo,
            otp: hashedOtp,
            otpExpires: Date.now() + 5 * 60 * 1000, // OTP expires in 5 min
            isVerified: false
        });


        // 💾 Save user to the database
        await newUser.save();

        // Send OTP via email
        await sendEmail(email, "Verify Your Email", `Your OTP is: ${otp}. It expires in 5 minutes.`);

        // Generate JWT Token
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" })
        // ye check krega ki ye valid user hai ya nhi us id ke madat se
        // ✅ Respond with success
        res.status(201).json({ message: "User created successfully", user: newUser, token, otp });
    } catch (error) {
        res.status(500).json({ message: "Error during signup", error });
    }
};
//vering signUp otp
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;        //extraction

        // 🔍 Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ⏳ Check if OTP is expired
        if (Date.now() > user.otpExpires) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // 🔑 Verify OTP
        const isOtpValid = await bcrypt.compare(otp, user.otp);
        if (!isOtpValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // ✅ Mark user as verified
        user.isVerified = true;
        user.otp = null; // Clear OTP after verification
        user.otpExpires = null;
        await user.save();

        res.status(200).json({ message: "User verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error verifying OTP", error });
    }
};
//SignIn Controller jwt
const signIn = async (req, res) => {
    try {
        const { email, password } = req.body; // Extract data from the request
        const getuser = await User.findOne({ email });

        if (!getuser) {
            return res.status(401).json({ message: "User not found" });

        }
        // 🔍 Check if user is verified
        if (!getuser.isVerified) {
            return res.status(403).json({ message: "User is not verified. Please verify your email before logging in." });
        }
        const checkPassword = await bcrypt.compare(password, getuser.password)

        if (!checkPassword) {
            return res.status(401).json({ message: "incorrect Password" });
        }
        const token = jwt.sign(                // Agar password sahi hai to JWT token bana rahe hain        
            { id: getuser._id, email: getuser.email },    // Token me user ka id aur email daal rahe hain
            process.env.JWT_SECRET,            // Secret key se token ko secure kar rahe hain
            { expiresIn: "1h" }                  // Token expires in 1 hour
        )

        return res.status(200).json({ message: "Login Sucess Fully", token })

    } catch (error) {
        res.status(500).json({ message: "Error during signup", error });
    }
};
//update userdetails
const updateUser = async (req, res) => {
    try {
        const { email, newEmail, newPassword } = req.body; // Extract current email, new email, and new password
        const userId = req.user.id; // Get user ID from the JWT token

        // ⚠️ Check if both fields are empty
        if (!newEmail && !newPassword) {
            return res.status(400).json({ message: "Please enter something to update" });
        }
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update email if provided
        if (newEmail) {
            const emailExists = await User.findOne({ email: newEmail });
            if (emailExists) {
                return res.status(400).json({ message: "Email already in use" });
            }
            user.email = newEmail;
        }

        // Update password if provided
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
        }

        // Save updates
        await user.save();

        res.status(200).json({ message: "User details updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Error updating user details", error });
    }
};
//delete user details
const deleteUser = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from the JWT token

        // Find and delete the user
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error });
    }
};

// ✅ Export the controller function
module.exports = {createSuperAdmin,createAdmin,signup, signIn, forgotPassword, resetPassword, updateUser, deleteUser, verifyOtp };
