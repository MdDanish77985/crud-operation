const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
//creating super admin 
// SuperAdmin initialization
async function initializeSuperAdmin() {
    try {
        const superAdminRole = await Role.findOne({ roleId: 1 }); // Find SuperAdmin role
        if (!superAdminRole) { // If SuperAdmin role not found
            return { success: false, message: "❌ Superadmin role not found" };
        }

        const superAdminName = "Md Danish"; 
        const superAdminEmail = "aec.cse.mddanish@gmail.com"; 
        const superAdminPassword = "superadmin00"; 

        // Check if SuperAdmin already exists
        const existingSuperAdmin = await User.findOne({ email: superAdminEmail });
        if (existingSuperAdmin) {
            return { success: false, message: "✅ Superadmin already exists" };
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

        // Create SuperAdmin user
        const superAdmin = new User({
            name: superAdminName,
            email: superAdminEmail,
            password: hashedPassword,
            roleId: 1,
            isVerified: true,
            isActive: true,
            userRoleId:1
        });

        await superAdmin.save(); // Save to database
        return { success: true, message: "✅ Superadmin created successfully" };
    } catch (error) {
        return { success: false, message: "❌ Error initializing Superadmin", error: error.message };
    }
}

module.exports = { initializeSuperAdmin };
