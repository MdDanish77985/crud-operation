require("dotenv").config();                     // Load env variables
// ✅ Import required modules
const express = require("express");            // Import Express for creating the server
// const bcrypt = require("bcrypt");
const mongoose = require("mongoose");          // Import Mongoose to connect with MongoDB
const authRoutes = require("./routes/authRoutes"); // Import signup routes

// ✅ Initialize Express app
const app = express();                         // Create an Express application instance

// ✅ Middleware to parse JSON
app.use(express.json());                       // Middleware to handle incoming JSON requests

// ✅ Routes
app.use("/api", authRoutes);              // All signup routes are prefixed with '/api/auth'

// ✅ Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/signUp")
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch(error => console.log("❌ MongoDB connection error:", error));

// ✅ Start the server
app.listen(3000, () => console.log("🚀 Server is running on port 3000"));
