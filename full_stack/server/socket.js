// socket.js
const { Server } = require("socket.io");
const User = require('./models/User'); // ✅ Import your User model (adjust the path)
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

let io;

const connectedUsers = new Map(); // userId -> socket.id
const onlineUsers = new Set();

function setupSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173", // React frontend
            credentials: true,
        },
    });

    io.use((socket, next) => {
        const { cookie: cookieHeader } = socket.handshake.headers;

        if (!cookieHeader) {
            return next(new Error("No cookies found"));
        }

        const cookies = cookie.parse(cookieHeader);
        const token = cookies.token;

        if (!token) {
            return next(new Error("Authentication token missing in cookies"));
        }

        try {
            const user = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = user;
            next();
        } catch (err) {
            return next(new Error("Invalid authentication token"));
        }
    })

    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        // Save the userId when client identifies
        socket.on("register-user", (userId) => {
            connectedUsers.set(userId, socket.id);
            console.log(`User ${userId} registered with socket ${socket.id}`);
            emitOnlineUsers()
        });

        // Handle private message
        socket.on("private-message", async ({ message, to }) => {
            const recipientSocketId = connectedUsers.get(to);
            if (recipientSocketId) {
                // ✅ Fetch sender details
                const sender = await User.findById(message.senderId).select('name');
                const senderName = sender?.name || "User";

                io.to(recipientSocketId).emit("receive-message", {
                    message,
                    from: message.senderId,
                    to: to
                });
                // console.log("receive-message", message)
                sendNotification(to, {
                    type: "message",
                    from: message.senderId,
                    senderName,
                    message
                });
            }
        });

        // Handle typing indicator
        socket.on("typing", ({ toUserId }) => {
            // Get the sender's user ID from the connectedUsers map
            let fromUserId;
            for (const [userId, sockId] of connectedUsers.entries()) {
                if (sockId === socket.id) {
                    fromUserId = userId;
                    break;
                }
            }
            
            if (!fromUserId) {
                console.log("Could not find user ID for socket:", socket.id);
                return;
            }
            
            // Get the recipient's socket ID
            const recipientSocketId = connectedUsers.get(toUserId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("typing", { fromUserId });
                console.log("typing event sent:", fromUserId, "->", toUserId);
            }
        });

        // Handle stop typing indicator
        socket.on("stop-typing", ({ toUserId }) => {
            // Get the sender's user ID from the connectedUsers map
            let fromUserId;
            for (const [userId, sockId] of connectedUsers.entries()) {
                if (sockId === socket.id) {
                    fromUserId = userId;
                    break;
                }
            }
            
            if (!fromUserId) {
                console.log("Could not find user ID for socket:", socket.id);
                return;
            }
            
            // Get the recipient's socket ID
            const recipientSocketId = connectedUsers.get(toUserId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("stop-typing", { fromUserId });
                console.log("stop typing event sent:", fromUserId, "->", toUserId);
            }
        });

        socket.on("disconnect", () => {
            for (const [userId, sockId] of connectedUsers.entries()) {
                if (sockId === socket.id) {
                    connectedUsers.delete(userId);
                    break;
                }
            }
            console.log("Client disconnected:", socket.id);
            emitOnlineUsers()
        });

        socket.on("offline", () => {
            console.log("Client disconnected:", socket.id);
            // send all online users to all users
            emitOnlineUsers();
        });

        function emitOnlineUsers() {
            const onlineUserIds = [...connectedUsers.keys()];
            io.emit("online-users", onlineUserIds);
        }

        function sendNotification(toUserId, notification) {
            const socketId = connectedUsers.get(toUserId);
            if (socketId) {
                io.to(socketId).emit("notification", notification);
            }
        }
    });
}

module.exports = { setupSocket, getIO: () => io };
