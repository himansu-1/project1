const express = require("express");
const dotenv = require("dotenv");
var cors = require('cors')
const cookieParser = require("cookie-parser");


const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");
const messageRoutes = require("./routes/messageRoutes");
const errorHandler = require("./middlewares/errorMiddleware");
const parseFormData = require("./middlewares/parseFormData");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
// Parse URL-encoded bodies (for form-data and x-www-form-urlencoded)
// app.use(express.urlencoded({ extended: true }));
app.use(parseFormData);

app.use(cookieParser());

// var corsOptions = {
//   "origin": "*",
//   "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
//   "preflightContinue": false,
//   "optionsSuccessStatus": 204
// }
const corsOptions = {
  origin: 'http://localhost:5173', // your React app's origin (Vite default port)
  credentials: true,               // required to allow cookies
};

app.use(cors(corsOptions))

app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/messages", messageRoutes);

app.use(errorHandler); // Global error handler

module.exports = app;
