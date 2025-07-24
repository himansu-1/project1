const { default: mongoose } = require('mongoose');
// const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

exports.createChat = async (req, res) => {
    console.log("/create");
    try {
        const { user2 } = req.body;
        const user1 = req.user._id.toString(); // From middleware

        // Check if chat already exists between users
        let chat = await Chat.findOne({
            members: { $all: [user1, user2], $size: 2 }
        });

        if (!chat) {
            chat = new Chat({ members: [user1, user2] });
            await chat.save();
        }

        res.json(chat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getChatsByUser = async (req, res) => {
    console.log("/user");
    try {
        // console.log(112);

        const senderId = req.user._id.toString(); // From middleware

        const chats = await Chat.find({ members: senderId })
        // .populate('members', 'name email');
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// GET /api/messages/:userId?page=1&limit=20
exports.getMessages = async (req, res) => {
    console.log("/:user");

    try {
        // console.log(2111);

        const { user2 } = req.params;
        const user1 = req.user._id.toString(); // From middleware

        const chat = await Chat.findOne({
            members: { $all: [user1, user2], $size: 2 }
        });

        // if (!chat) return res.status(404).json({ error: 'Chat not found' });
        if (!chat) return res.status(200).json([]);

        // const messages = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 });

        // pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const messages = await Message.find({ chatId: chat._id })
            .sort({ createdAt: -1 }) // Most recent first
            .skip(skip)
            .limit(limit);

        res.json({ chatId: chat._id, messages: messages.reverse(), hasMore: messages.length === limit }); // Reverse to show oldest at top

        // res.json({ chatId: chat._id, messages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.sendMessage = async (req, res) => {
    console.log("/send");
    try {
        const { chatId, messageText, media, receiverId } = req.body;
        const senderId = req.user._id.toString(); // From middleware

        if (!messageText || (!chatId && !receiverId)) {
            return res.status(400).json({ error: 'chatId or receiverId and messageText are required.' });
        }

        let finalChatId = chatId;

        // If no chatId, create/find chat between sender and receiver
        if (!finalChatId) {
            let chat = await Chat.findOne({
                members: { $all: [senderId, receiverId], $size: 2 }
            });

            if (!chat) {
                chat = new Chat({ members: [senderId, receiverId] });
                await chat.save();
            }

            finalChatId = chat._id;
        }


        const message = new Message({
            chatId: finalChatId,
            senderId,
            messageText,
            media,
            readBy: [senderId],
        });
        await message.save();

        // Update chat last activity
        await Chat.findByIdAndUpdate(finalChatId, { lastActivity: Date.now() });

        res.status(201).json({ message, chatId: finalChatId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.markRead = async (req, res) => {
    console.log("/mark-read");
    try {
        const { chatId } = req.body;
        const user1 = req.user._id.toString(); // From middleware

        await Message.updateMany(
            { chatId, readBy: { $ne: user1 } },
            { $push: { readBy: user1 } }
        );

        res.json({ message: 'All messages marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// router.get('/unread/:chatId/:userId', async (req, res) => {
exports.getUnreadMessages = async (req, res) => {
    try {
        const { chatId, userId } = req.params;

        const unread = await Message.find({
            chatId,
            readBy: { $ne: userId }
        });

        res.json(unread);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// exports.getChatUsers = async (req, res) => {
//     console.log("/chat-users");

//   try {

//     const userId = req.user._id.toString();

//     const chats = await Chat.find({ members: new mongoose.Types.ObjectId(userId) });

//     const otherUserIds = chats
//       .flatMap(chat => chat.members)
//       .filter(memberId => memberId.toString() !== userId);

//     const uniqueUserIds = [...new Set(otherUserIds.map(id => id.toString()))];

//     const users = await User.find({ _id: { $in: uniqueUserIds } }).select('name email');

//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
exports.getChatUsers = async (req, res) => {
    try {
        const userId = req.user._id.toString();

        // const chats = await Chat.find({ members: new mongoose.Types.ObjectId(userId) });
        // Get chats involving the user, sorted by most recently updated
        const chats = await Chat.find({ members: userId })
            .sort({ lastActivity: -1 }) // descending (most recent first)
            .lean(); // slightly faster read-only

        const results = await Promise.all(
            chats.map(async (chat) => {
                const otherUserId = chat.members.find(id => id.toString() !== userId);
                const user = await User.findById(otherUserId).select('name email');

                if (user) {
                    // Fetch unread messages for this chat
                    const unreadMessages = await Message.find({
                        chatId: chat._id,
                        readBy: { $ne: userId }, // not read by this user
                        senderId: { $ne: userId } // exclude own messages
                    })
                        .sort({ createdAt: -1 }) // newest first
                        .limit(1) // only the latest unread
                        .lean();

                    const latestUnreadMessage = unreadMessages[0];

                    // Count total unread messages for this chat
                    const unreadCount = await Message.countDocuments({
                        chatId: chat._id,
                        readBy: { $ne: userId },
                        senderId: { $ne: userId }
                    });
                    return {
                        chatId: chat._id,
                        user: {
                            _id: user._id,
                            name: user.name,
                            email: user.email,
                        },
                        lastUnreadMessage: latestUnreadMessage?.messageText || null,
                        unreadCount,
                    };
                }
                return null;
            })
        );

        res.json(results.filter(Boolean));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
