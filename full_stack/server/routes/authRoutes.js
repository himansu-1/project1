const express = require("express");
const { register, login, logout, getUserList, getCurrentUser, googleLogin } = require("../controllers/authController");
const upload = require("../middlewares/uploadImage");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

// router.post("/register", upload.single("image"), register);
router.post("/google-login", googleLogin);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);


router.use(protect)
router.get("/me", getCurrentUser);
router.get("/users", getUserList);

module.exports = router;
