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

const corsOptions = {
  // origin: '*', // your React app's origin (Vite default port)
  origin: 'http://localhost:5173', // your React app's origin (Vite default port)
  credentials: true,               // required to allow cookies
};
app.use(cors(corsOptions))
// app.options("*", cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/messages", messageRoutes);

app.use(errorHandler); // Global error handler

module.exports = app;
