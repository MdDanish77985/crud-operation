// ✅ Import nodemailer library
const nodemailer = require("nodemailer");  // Used to send emails

// ✅ Create transporter for sending emails
const transporter = nodemailer.createTransport({
    service: "gmail",                      // Using Gmail to send emails
    auth: {                                // Authentication details
        user: process.env.EMAIL_USER,      // Your Gmail address from .env
        pass: process.env.EMAIL_PASS,      // App-specific password from .env
    },
});

// ✅ Function to send email with OTP or reset link
const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,      // Sender's email (from .env)
            to,                                // Receiver's email (passed to function)
            subject,                           // Email subject (e.g., "Reset Password")
            text,                              // Email body (e.g., OTP or reset link)
        };
    
        // 🔔 Send email using the transporter
        await transporter.sendMail(mailOptions);  
    } catch (error) {
        console.error("Error sending email:", error); // Fix: Added error handling
    }
};

module.exports = sendEmail;  // Export function to use elsewhere
