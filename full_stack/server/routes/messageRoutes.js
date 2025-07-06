const express = require("express");
const { createChat, getChatsByUser, getMessages, markRead, getUnreadMessages, sendMessage, getChatUsers } = require("../controllers/messageController");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect); // all routes below are protected

// router.post("/create", createChat);
// router.get("/user", getChatsByUser);
router.post("/send", sendMessage);
router.put("/mark-read", markRead);
// router.get("/", getUnreadMessages);
router.get("/chat-users", getChatUsers)
router.get("/:user2", getMessages);

module.exports = router;
