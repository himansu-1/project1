const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const logUserAction = require('../utils/logUserAction');
const uploadImage = require('../utils/uploadImages');
const admin = require("../config/firebase");

exports.register = async (req, res) => {
    console.log("/register");
    
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // Access uploaded file
    const file = req.file;

    let imageData = {};
    if (file) {
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        imageData = await uploadImage(base64, 'user-profiles');
    }

    const user = await User.create({
        name, email, password,
        profile_image: imageData.url || '',
        profile_image_id: imageData.public_id || '',
        auth_type: "direct"
    });

    const token = generateToken(user._id);

    await logUserAction({ userId: user._id, action: 'register', req });

    // Set cookie with token
    res.cookie("token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production", 
        secure: false, // only over HTTPS in production
        sameSite: "strict", // CSRF protection
        maxAge: 60 * 60 * 1000,
    });

    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
    })
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
        return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    // Set cookie with token
    res.cookie("token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        secure: false, // only over HTTPS in production
        sameSite: "strict", // CSRF protection
        maxAge: 60 * 60 * 1000,
    });

    await logUserAction({ userId: user._id, action: 'login', req });

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
    });
};

exports.logout = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        secure: false, // only over HTTPS in production
        sameSite: "strict", // CSRF protection
        maxAge: 0,
    });
    res.status(200).json({ message: "Logged out" });
};

exports.getCurrentUser = async (req, res) => {
    const token = req.cookies.token;
    try {
        res.status(200).json(req.user);
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

exports.getUserList = async (req, res) => {
    try{
        // const users = await User.find({ _id: { $ne: req.user._id } });
        const users = await User.find({ _id: { $ne: req.user._id } }).sort({ name: 1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.googleLogin = async (req, res) => {
    
  try {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture, uid } = decodedToken;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: uid,
        profile_image: picture,
        uid,
        isGoogleLogin: true,
        auth_type: "google"
      });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Google login failed" });
  }
};