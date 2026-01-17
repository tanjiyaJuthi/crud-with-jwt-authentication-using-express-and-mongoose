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