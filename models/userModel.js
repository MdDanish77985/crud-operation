// ✅ Import mongoose
const mongoose = require("mongoose");

// ✅ Create User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, default: null },      // User name (optional)
    email: { type: String, required: true },    // User email (mandatory)
    password: { type: String, required: true } , // User password (mandatory)
    otp: { type: String },                    // Stores OTP
    otpExpires: { type: Date },               // OTP expiry time
    photo: {type: String}                     //for add photo
});

// ✅ Create User model
const User = mongoose.model("signupsuser", userSchema); // Model name: 'User', collection: 'users'

// ✅ Export the User model
module.exports = User;
