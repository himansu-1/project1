const Todo = require("../models/Todo");

exports.getTodos = async (req, res) => {
    const todos = await Todo.find({ user: req.user._id });
    res.json(todos);
};

exports.createTodo = async (req, res) => {
    const { title } = req.body;
    const todo = await Todo.create({ title, user: req.user._id });
    res.status(201).json(todo);
};

exports.updateTodo = async (req, res) => {
    const todo = await Todo.findById(req.params.id);
    if (!todo || todo.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: "Todo not found" });
    }

    todo.title = req.body.title || todo.title;
    todo.completed = req.body.completed ?? todo.completed;
    const updated = await todo.save();
    res.json(updated);
};

exports.deleteTodo = async (req, res) => {
    const todo = await Todo.findById(req.params.id);
    if (!todo || todo.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: "Todo not found" });
    }

    await todo.deleteOne();
    res.json({ message: "Todo deleted" });
};
