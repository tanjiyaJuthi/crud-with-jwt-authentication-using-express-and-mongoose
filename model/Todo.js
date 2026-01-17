import mongoose from 'mongoose';
import todoSchema from '../schema/todoSchema.js';

// If model already exists
const Todo = mongoose.models.Todo || mongoose.model('Todo', todoSchema);

export default Todo;