import mongoose from 'mongoose'; 

const { Schema } = mongoose;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        },
        todos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Todo'
        }]
    },
    {
        timestamps: true
    }
);

export default userSchema;