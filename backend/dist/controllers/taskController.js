import { validationResult } from 'express-validator';
import Task from '../models/Task.js';
export const getTasks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { status, priority, sortBy = 'dueDate', order = 'asc' } = req.query;
        const filter = {
            $or: [{ createdBy: req.user?.id }, { assignedTo: req.user?.id }],
        };
        if (status)
            filter.status = status;
        if (priority)
            filter.priority = priority;
        const sortOrder = order === 'desc' ? -1 : 1;
        const sortObj = { [sortBy]: sortOrder };
        const tasks = await Task.find(filter)
            .populate('createdBy', 'name email avatar')
            .populate('assignedTo', 'name email avatar')
            .sort(sortObj)
            .skip(skip)
            .limit(limit);
        const total = await Task.countDocuments(filter);
        res.json({
            tasks,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('createdBy', 'name email avatar')
            .populate('assignedTo', 'name email avatar');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const hasAccess = task.createdBy._id.toString() === req.user?.id ||
            task.assignedTo.some((user) => user._id.toString() === req.user?.id);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied' });
        }
        res.json(task);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const createTask = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, description, dueDate, priority, assignedTo } = req.body;
        const task = new Task({
            title,
            description,
            dueDate,
            priority,
            createdBy: req.user?.id,
            assignedTo: assignedTo || [],
        });
        await task.save();
        await task.populate('createdBy', 'name email avatar');
        await task.populate('assignedTo', 'name email avatar');
        res.status(201).json(task);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const hasAccess = task.createdBy.toString() === req.user?.id ||
            task.assignedTo.some((userId) => userId.toString() === req.user?.id);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { title, description, dueDate, priority, status } = req.body;
        if (title)
            task.title = title;
        if (description !== undefined)
            task.description = description;
        if (dueDate)
            task.dueDate = dueDate;
        if (priority)
            task.priority = priority;
        if (status)
            task.status = status;
        await task.save();
        await task.populate('createdBy', 'name email avatar');
        await task.populate('assignedTo', 'name email avatar');
        res.json(task);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.createdBy.toString() !== req.user?.id) {
            return res.status(403).json({ message: 'Only creator can delete task' });
        }
        await task.deleteOne();
        res.json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const hasAccess = task.createdBy.toString() === req.user?.id ||
            task.assignedTo.some((userId) => userId.toString() === req.user?.id);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied' });
        }
        task.status = status;
        await task.save();
        await task.populate('createdBy', 'name email avatar');
        await task.populate('assignedTo', 'name email avatar');
        res.json(task);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const updateTaskPriority = async (req, res) => {
    try {
        const { priority } = req.body;
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const hasAccess = task.createdBy.toString() === req.user?.id ||
            task.assignedTo.some((userId) => userId.toString() === req.user?.id);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied' });
        }
        task.priority = priority;
        await task.save();
        await task.populate('createdBy', 'name email avatar');
        await task.populate('assignedTo', 'name email avatar');
        res.json(task);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
