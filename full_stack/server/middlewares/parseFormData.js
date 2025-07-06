// middlewares/parseFormData.js
const multer = require("multer");
const storage = multer.memoryStorage(); // No file saving needed
const upload = multer({ storage });

module.exports = upload.none(); // Accept only text fields
