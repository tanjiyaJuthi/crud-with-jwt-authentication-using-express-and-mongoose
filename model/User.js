import mongoose from 'mongoose';
import userSchema from '../schema/userSchema.js';

// If model already exists
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;