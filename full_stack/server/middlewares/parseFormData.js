// middlewares/parseFormData.js
const multer = require("multer");
// const storage = multer.memoryStorage(); // No file saving needed
// const upload = multer({ storage });

// module.exports = upload.none(); // Accept only text fields



const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // max 10 MB
  },
});

module.exports = upload.single('profile_image');