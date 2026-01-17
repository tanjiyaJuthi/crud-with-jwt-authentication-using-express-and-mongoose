import express from 'express';
import Todo from '../model/Todo.js';
import authGuard from '../middleware/authGuard.js';
import { validateTodo } from '../middleware/validation.js';

const router = express.Router();

// get all the todos
router.get('/', authGuard, async (req, res) => {
    try {
        console.log(req.user);
        const getAllTodo = await Todo
                .find()
                .select({
                    _id: 0,
                    __v: 0,
                    date: 0
                })
                .limit(2);

        res.status(200)
            .json({
                todos: getAllTodo
            });
    } catch (error) {
        // console.log(error);
        res.status(500)
            .json({ message: 'There was a server-side error!' });
    }
});

// get all the todos with pagination
router.get('/', authGuard, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalTodos = await Todo
            .find()
            .skip(skip)
            .limit(limit)
            .sort({ date: -1 });

        res.status(200)
            .json({
                page,
                limit,
                totalPages: Math.ceil(totalTodos / limit),
                totalTodos
            });
    } catch (error) {
        res.status(500)
            .json({ error: 'There was a server-side error!' });
    }
});

// get by status
router.get('/status/:status', authGuard, async (req, res) => {
    try {
        const getInactiveTodos = await Todo
            .find({ status: req.params.status })
            .sort({date: -1 });

        res.status(200)
            .json({ todos: getInactiveTodos });
    } catch (error) {
        res.status(500)
            .json({ error: 'There was a server-side error!' });
    }
});

// get a todo by id
router.get('/:id', authGuard, async (req, res) => {
    try {
        const getTodo = await Todo.findById(req.params.id);

        if (!getTodo) {
            return res.status(404)
                .json({ error: 'Todo not found!' });
        }

        res.status(200)
            .json({ todo: getTodo });
    } catch (error) {
        res
            .status(500)
            .json({ error: 'There was a server-side error!' });
    }
});

// post a todo
router.post('/', authGuard, validateTodo, async (req, res) => {
    try {
        const newTodo = new Todo(req.body);

        await newTodo.save();

        res.status(200)
            .json({
                message: 'Todo has been inserted successfully!',
                todo: newTodo
        });
    } catch (error) {
        res.status(500)
            .json({ error: 'There was a server-side error!' });
    }
});

// post multiple todo
router.post('/all', authGuard, validateTodo, async (req, res) => {
    try {
        const data = req.body;

        if (!Array.isArray(data)) {
            return res.status(400)
                .json({ error: 'Request body must be an array of todos!' });
        }

        const newTodo = await Todo.insertMany(data);

        res.status(200)
            .json({
                message: 'Todos has been inserted successfully!',
                todo: newTodo
            });
    } catch (error) {
        res.status(500)
            .json({ error: 'There was a server-side error!' });
    }
});

// update a todo
router.put('/:id', authGuard, validateTodo, async (req, res) => {
    try {
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedTodo) {
            return res.status(404)
                .json({ error: 'Todo not found!' });
        }

        res.status(200)
            .json({
                message: 'Todo has been updated successfully!',
                todo: updatedTodo
            });
    } catch (error) {
        res.status(500)
            .json({ error: 'There was a server-side error!' });
    }
});

//delete todo
router.delete('/:id', authGuard, async (req, res) => {
    try {
        const deletedTodo = await Todo.findByIdAndDelete(req.params.id);

        if (!deletedTodo) {
            return res.status(404)
                    .json({ error: 'Todo not found!' });
        }

        res.status(200)
            .json({
                message: 'Todo has been deleted successfully!',
                todo: deletedTodo
            });
    } catch (error) {
        res.status(500)
            .json({ error: 'There was a server-side error!' });
    }
});

const todoHandler = router;
export default todoHandler;