import mongoose, { Document, Schema } from 'mongoose';
const taskSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required'],
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending',
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignedTo: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
}, {
    timestamps: true,
});
taskSchema.index({ createdBy: 1, dueDate: 1 });
taskSchema.index({ assignedTo: 1 });
export default mongoose.model('Task', taskSchema);
