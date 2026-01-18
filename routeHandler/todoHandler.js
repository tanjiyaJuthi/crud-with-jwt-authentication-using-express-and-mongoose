import express from 'express';
import Todo from '../model/Todo.js';
import User from '../model/User.js';
import authGuard from '../middleware/authGuard.js';
import { validateTodo, validateTodosArray } from '../middleware/validation.js';
import mongoose from 'mongoose';

const router = express.Router();

// get all the todos with pagination
router.get('/', authGuard, async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        // get paginated todos for the logged-in user
        const todos = await Todo
            .find({ user: req.userId })
            .populate('user', 'name username -_id')
            .select('-__v -date')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        // count total todos for the logged-in user
        const totalCount = await Todo.countDocuments({ user: req.userId });

        res.status(200)
            .json({
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
                totalTodos: totalCount, todos
            });
    } catch (error) {
        res.status(500)
            .json({ error: 'There was a server-side error!' });
    }
});

// get by status
router.get('/status/:status', authGuard, async (req, res) => {
    try {
        const allowedStatus = ['active', 'inactive'];

        if (!allowedStatus.includes(req.params.status)) {
            return res.status(400).json({
                error: 'Invalid status value'
            });
        }

        const todos = await Todo
            .find({
                status: req.params.status,
                user: req.userId
            })
            .populate('user', 'name username -_id')
            .select('-__v -date')
            .sort({ date: -1 });

        res.status(200)
            .json({ todos });
    } catch (error) {
        res.status(500)
            .json({ error: 'There was a server-side error!' });
    }
});

// get a todo by id
router.get('/:id', authGuard, async (req, res) => {
    try {
        const todo = await Todo
            .findOne({
                _id: req.params.id,
                user: req.userId
            })
            .populate('user', 'name username -_id')
            .select('-__v -date');;

        if (!todo) {
            return res.status(404)
                .json({ error: 'Todo not found!' });
        }

        res.status(200)
            .json({ todo: todo });
    } catch (error) {
        res
            .status(500)
            .json({ error: 'There was a server-side error!' });
    }
});

// post a todo
router.post('/', authGuard, validateTodo, async (req, res) => {
    try {
        const newTodo = new Todo({
            ...req.body,
            user: req.userId
        });

        const savedTodo = await newTodo.save();

        await User.updateOne(
            { _id: req.userId },
            { $push : { todos: savedTodo._id }}
        );

        const populatedTodo = await Todo
            .findById(savedTodo._id)
            .populate('user', 'name username -_id')
            .select('-__v -date');

        res.status(200)
            .json({
                message: 'Todo has been inserted successfully!',
                todo: populatedTodo
        });
    } catch (error) {
        res.status(500)
            .json({ error: 'There was a server-side error!' });
    }
});

// post multiple todo
router.post('/all', authGuard, validateTodosArray, async (req, res) => {
    try {
        const data = req.body;

        if (!Array.isArray(data)) {
            return res.status(400)
                .json({ error: 'Request body must be an array of todos!' });
        }

        // attach user ID to each todo
        const todosWithUser = data.map(todo => ({
            ...todo,
            user: req.userId
        }));

        // insert all todos
        const insertedTodos = await Todo.insertMany(todosWithUser);

        // update User.todos field
        const todoIds = insertedTodos.map(todo => todo._id);
        await User.updateOne(
            { _id: req.userId },
            { $push: { todos: { $each: todoIds } } }
        );

        // fetch todos with populated user
        const populatedTodos = await Todo
            .find({ _id: { $in: todoIds } })
            .populate('user', 'name username -_id')
            .select('-__v -date')
            .sort({ date: -1 });

        res.status(200)
            .json({
                message: 'Todos has been inserted successfully!',
                todo: populatedTodos
            });
    } catch (error) {
        console.error(error);
        res.status(500)
            .json({ error: 'There was a server-side error!' });
    }
});

// update a todo
router.put('/:id', authGuard, validateTodo, async (req, res) => {
    try {
        // validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400)
                .json({ error: 'Invalid todo ID' });
        }

        // find and update ffor logged in user
        const updatedTodo = await Todo
            .findOneAndUpdate(
                { 
                    _id: req.params.id,
                    user: req.userId
                },
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            )
            .populate('user', 'name username -_id')
            .select('-__v -date');

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
        console.log(error);
        res.status(500)
            .json({ error: 'There was a server-side error!' });
    }
});

//delete todo
router.delete('/:id', authGuard, async (req, res) => {
    try {
        // validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400)
                .json({ error: 'Invalid todo ID' });
        }

        // delete only if the todo belongs to the logged-in user
        const deletedTodo = await Todo
            .findOneAndDelete({
                _id: req.params.id,
                user: req.userId
            })
            .populate('user', 'name username -_id')
            .select('-__v -date');

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