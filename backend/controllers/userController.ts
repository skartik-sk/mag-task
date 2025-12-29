import { Response } from 'express';
import User from '../models/User.js';
import Task from '../models/Task.js';
import { AuthRequest } from '../middleware/auth.js';

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email query required' });
    }

    const users = await User.find({
      email: { $regex: email as string, $options: 'i' },
      _id: { $ne: req.user?.id },
    })
      .select('name email avatar')
      .limit(10);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const assignUserToTask = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.createdBy.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Only creator can assign users' });
    }

    if (task.assignedTo.includes(userId)) {
      return res.status(400).json({ message: 'User already assigned' });
    }

    task.assignedTo.push(userId);
    await task.save();
    await task.populate('createdBy', 'name email avatar');
    await task.populate('assignedTo', 'name email avatar');

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeUserFromTask = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.createdBy.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Only creator can remove users' });
    }

    task.assignedTo = task.assignedTo.filter((id) => id.toString() !== userId);
    await task.save();
    await task.populate('createdBy', 'name email avatar');
    await task.populate('assignedTo', 'name email avatar');

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
