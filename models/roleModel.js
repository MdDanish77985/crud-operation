const mongoose = require("mongoose");

// Role Schema
const roleSchema = new mongoose.Schema({
    roleId: { type: Number, required: true, unique: true },
    roleName: { type: String, required: true, unique: true },
    isCapable: { type: Boolean, required: true },
});

// ✅ Use singular model name and let Mongoose pluralize automatically
const Role = mongoose.model("roles", roleSchema);

module.exports = Role;  // ✅ Ensure correct export
