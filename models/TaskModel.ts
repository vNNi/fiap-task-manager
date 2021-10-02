import mongoose, { Schema } from 'mongoose';

const TaskSchema = new Schema({
    name: { type: String, required: [true, '* Required field']},
    userId: { type: String, required: [true, '* Required field']},
    finishPrevisionDate: { type: Date, required: [true, '* Required field']},
    finishDate: { type: Date},
})

export const TaskModel = mongoose.models.tasks || mongoose.model('tasks', TaskSchema);