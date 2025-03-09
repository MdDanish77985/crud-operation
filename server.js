require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const Role = require("./models/roleModel"); // ✅ Corrected Import

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/signUp")
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch(error => console.log("❌ MongoDB connection error:", error));

const roles = [
    { roleId: 1, roleName: "superadmin", isCapable: true },
    { roleId: 2, roleName: "admin", isCapable: true },
    { roleId: 3, roleName: "user", isCapable: false }
];

async function insertRoles() {
    try {
        const existingRoles = await Role.find(); // ✅ Use Role directly
        if (existingRoles.length === 0) {
            await Role.insertMany(roles);
            console.log("✅ Roles inserted successfully");
        } else {
            console.log("✅ Roles already exist in the database");
        }
    } catch (error) {
        console.error("❌ Error inserting roles:", error);
    }
}

insertRoles(); // Insert roles when the server starts
app.use("/api", authRoutes);
app.listen(3000, () => console.log("🚀 Server is running on port 3000"));
