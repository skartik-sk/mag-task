import type { Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import User from '../models/User.js';
import type { AuthRequest } from '../middleware/auth.js';

// Helper function to get user by email (using searchUsers endpoint logic)
async function getUserByEmail(email: string) {
  const searchEmail = email.toLowerCase().trim();
  const users = await User.find({ email: { $regex: new RegExp(`^${searchEmail}$`, 'i') } }).limit(1);
  return users[0] || null;
}

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { status, priority, sortBy = 'dueDate', order = 'asc' } = req.query;

    const filter: any = {
      $or: [{ createdBy: req.user?.id }, { assignedTo: req.user?.id }],
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj: any = { [sortBy as string]: sortOrder };

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('assignedTo', 'name email avatar');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const hasAccess =
      task.createdBy._id.toString() === req.user?.id ||
      task.assignedTo.some((user: any) => user._id.toString() === req.user?.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, dueDate, priority, assignedTo, assignedEmails } = req.body;
    
    let assignedUserIds: mongoose.Types.ObjectId[] = [];
    
    // Start with any assignedTo IDs from request
    if (assignedTo && Array.isArray(assignedTo)) {
      assignedUserIds = assignedTo.map((id: any) => 
        typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
      );
    }
    
    // Handle email-based assignment
    if (assignedEmails && Array.isArray(assignedEmails) && assignedEmails.length > 0) {
      console.log('📧 Processing assignedEmails array:', assignedEmails);
      
      for (const email of assignedEmails) {
        // Use helper function to get user by email
        const user = await getUserByEmail(email);
        
        if (user) {
          const userIdString = user._id.toString();
          // Check if user ID is not already in the array
          const isAlreadyAssigned = assignedUserIds.some(id => id.toString() === userIdString);
          if (!isAlreadyAssigned) {
            assignedUserIds.push(user._id);
            console.log('✅ Added user to assignedUserIds:', user.name, user._id);
          } else {
            console.log('⚠️ User already in assignedUserIds:', user.name);
          }
        } else {
          console.log('❌ User not found for email:', email);
        }
      }
      console.log('📊 Final assignedUserIds:', assignedUserIds);
    }

    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      createdBy: req.user?.id,
      assignedTo: assignedUserIds,
    });

    await task.save();
    await task.populate('createdBy', 'name email avatar');
    await task.populate('assignedTo', 'name email avatar');

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const hasAccess =
      task.createdBy.toString() === req.user?.id ||
      task.assignedTo.some((userId) => userId.toString() === req.user?.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, dueDate, priority, status, assignedTo, assignedEmails } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (status) task.status = status;

    // Only task creator can update assignees
    if (task.createdBy.toString() === req.user?.id) {
      let assignedUserIds: mongoose.Types.ObjectId[] = [];
      
      // Start with any assignedTo IDs from request
      if (assignedTo !== undefined && Array.isArray(assignedTo)) {
        assignedUserIds = assignedTo.map((id: any) =>
          typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
        );
      }

      // Handle email-based assignment updates
      if (assignedEmails && Array.isArray(assignedEmails) && assignedEmails.length > 0) {
        for (const email of assignedEmails) {
          const user = await User.findOne({ email: email.toLowerCase().trim() });
          if (user) {
            const userIdString = user._id.toString();
            const isAlreadyAssigned = assignedUserIds.some(id => id.toString() === userIdString);
            if (!isAlreadyAssigned) {
              assignedUserIds.push(user._id);
            }
          }
        }
      }
      
      // Only update if there are changes to assignments
      if (assignedTo !== undefined || (assignedEmails && assignedEmails.length > 0)) {
        task.assignedTo = assignedUserIds;
      }
    }

    await task.save();
    await task.populate('createdBy', 'name email avatar');
    await task.populate('assignedTo', 'name email avatar');

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const hasAccess =
      task.createdBy.toString() === req.user?.id ||
      task.assignedTo.some((userId) => userId.toString() === req.user?.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.status = status;
    await task.save();
    await task.populate('createdBy', 'name email avatar');
    await task.populate('assignedTo', 'name email avatar');

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const assignUserByEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.createdBy.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Only creator can assign users' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    if (task.assignedTo.includes(user._id)) {
      return res.status(400).json({ message: 'User already assigned' });
    }

    task.assignedTo.push(user._id);
    await task.save();
    await task.populate('createdBy', 'name email avatar');
    await task.populate('assignedTo', 'name email avatar');

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const unassignUser = async (req: AuthRequest, res: Response) => {
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

export const updateTaskPriority = async (req: AuthRequest, res: Response) => {
  try {
    const { priority } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const hasAccess =
      task.createdBy.toString() === req.user?.id ||
      task.assignedTo.some((userId) => userId.toString() === req.user?.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.priority = priority;
    await task.save();
    await task.populate('createdBy', 'name email avatar');
    await task.populate('assignedTo', 'name email avatar');

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
