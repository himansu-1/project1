const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage(); // or diskStorage if you prefer saving locally

const uploadImage = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      return cb(new Error("Only images are allowed"));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

module.exports = uploadImage;
