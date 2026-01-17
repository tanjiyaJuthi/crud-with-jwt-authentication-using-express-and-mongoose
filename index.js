import express from 'express';
import mongoose from 'mongoose';
import todoHandler from './routeHandler/todoHandler.js';
import userHandler from './routeHandler/userHandler.js';
import dotenv from 'dotenv';

const app = express();
const PORT = 3000;

// to bring environment variable
dotenv.config();

// middleware
app.use(express.json());

// database
mongoose
    .connect('mongodb://127.0.0.1:27017/todos')
    .then(() => {
        console.log('Mongo DB Connected!')
    }) 
    .catch((error) => {
        console.error('Mongo DB Connection Error:', error);
    });

// test route
app.get('/', (req, res) => {
    res.status(200).send('Get Hello from Express!');
});

// application routes
app.use('/todo', todoHandler);
app.use('/user', userHandler);

// start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});