import { body, validationResult } from 'express-validator';

// todo validation
export const validateTodo = [
    body('title')
        .notEmpty().withMessage('Title is required!')
        .isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    body('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status value'),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400)
                .json({
                    errors: errors.array()
                });
        }

        next();
    }
];

// multiple todo validation at once
export const validateTodosArray = async (req, res, next) => {
    const todos = req.body;

    if (!Array.isArray(todos) || todos.length === 0) {
        return res.status(400).json({
            error: 'Request body must be a non-empty array of todos'
        });
    }

    // Validate each todo
    const errors = [];

    todos.forEach((todo, index) => {
        if (!todo.title || typeof todo.title !== 'string') {
            errors.push({ index, field: 'title', message: 'Title is required' });
        } else if (todo.title.length < 3) {
            errors.push({ index, field: 'title', message: 'Title must be at least 3 characters' });
        } else if (todo.title.length > 100) {
            errors.push({ index, field: 'title', message: 'Title cannot exceed 100 characters' });
        }

        if (!todo.description || typeof todo.description !== 'string') {
            errors.push({ index, field: 'description', message: 'Description is required' });
        } else if (todo.description.length > 500) {
            errors.push({ index, field: 'description', message: 'Description cannot exceed 500 characters' });
        }

        if (todo.status && !['active', 'inactive'].includes(todo.status)) {
            errors.push({ index, field: 'status', message: 'Invalid status value' });
        }
    });

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

// user signup validation
export const validateUserSignup = [
    body('name')
        .notEmpty().withMessage('Name is required'),
    body('username')
        .notEmpty().withMessage('Username is required'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400)
                .json({
                    errors: errors.array()
                });
        }
        
        next();
    }
];
