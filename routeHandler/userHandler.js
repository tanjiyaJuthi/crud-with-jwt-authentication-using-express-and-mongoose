import express from 'express';
import User from '../model/User.js';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { validateUserSignup } from '../middleware/validation.js';

const router = express.Router();

// signup 
router.post('/signup', validateUserSignup, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(
            req.body.password,
            10
        );

        const newUser = new User({
            name: req.body.name,
            username: req.body.username,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201)
            .json({
                message: 'Signup has done successfully!',
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    username: newUser.username,
                    status: newUser.status
                }
            });
    } catch (error) {
        res.status(400).json({
            message: 'Signup failed!'
        });
    }
});

// login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: 'Username and password are required'
            });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401)
                .json({
                    error: 'Authentication failed'
                });
        }

        const isValidPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!isValidPassword) {
            return res.status(401)
                .json({
                    error: 'Authenticaton Failed'
                });
        }

        // generate token
        const token = jwt.sign({
            username: user.username,
            userId: user._id,
        }, process.env.JWT_SECRET,
        {
            expiresIn: '1h'
        });

        res.status(200)
            .json({
                access_token: token,
                message: 'Logn Successfull!'
            });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

const userHandler = router;
export default userHandler;