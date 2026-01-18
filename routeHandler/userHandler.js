import express from 'express';
import User from '../model/User.js';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { validateUserSignup } from '../middleware/validation.js';
import authGuard from '../middleware/authGuard.js';
import mongoose from 'mongoose';

const router = express.Router();

// get all user (public route)
router.get('/all', async (req, res) => {
    try {
        const users = await User
            .find()
            .populate('todos');

        res.status(201)
            .json({
                message: 'All user fetched successfully!',
                data: users
            });
    } catch (error) {
        console.log(error);

        res.status(400).json({
            message: 'Server side error!'
        });
    }
});

// signup (public route)
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

// update user
router.put('/:id', authGuard, async (req, res) => {
    try {
        const userId = req.params.id;

        // validate object id
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400)
                .json({ error: 'Invalid user id' });
        }

        // allow to update own account
        if (req.userId != userId) {
            return res.status(403)
                .json({ error: 'Access denied' });
        }

        const updateData = { ...req.body };

        // if password is being updated, hash it
        if (updateData.password) {
            updateData.password = await bcrypt.hash(
                updateData.password,
                10
            )
        }

        const updateUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updateUser) {
            return res.status(404)
                .json({ error: 'User not found' });
        }

        res.status(201)
            .json({
                message: 'All user fetched successfully!',
                data: updateUser
            });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: 'Server side error!'
        });
    }
});

const userHandler = router;
export default userHandler;