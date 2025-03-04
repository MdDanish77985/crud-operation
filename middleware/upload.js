const multer = require("multer");

// 🗂️ Storage configuration - image kaha save hogi
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Images "uploads/" folder me save hogi
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Unique name de rahe hain
    }
});

// 📷 File filter - sirf images allow karne ke liye
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true); // ✅ Image allowed
    } else {
        cb(new Error("Only image files are allowed!"), false); // ❌ Agar image nahi hai
    }
};

// 📤 Multer setup
const upload = multer({ storage: storage, fileFilter: fileFilter });
// 🔹 multer({}) ka use karke hum storage aur fileFilter set kar rahe hain.
// 🔹 Yeh Multer instance banayega jo images ko uploads/ me store karega aur sirf images allow karega.
module.exports = upload;
