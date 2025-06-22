const express = require("express");
const {
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo
} = require("../controllers/todoController");
const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/test", (req, res)=> {
    
    // // Set cookie with token
    // res.cookie("token", "testing token 987654321", {
    //     httpOnly: true,
    //     // secure: process.env.NODE_ENV === "production",
    //     secure: false, // only over HTTPS in production
    //     sameSite: "strict", // CSRF protection
    //     maxAge: 60 * 60 * 1000,
    // });

    res.send("working")
});
router.use(protect); // all routes below are protected

router.get("/", getTodos);
router.post("/", createTodo);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

module.exports = router;
