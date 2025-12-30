import { Router } from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskPriority,
  assignUserByEmail,
  unassignUser,
} from '../controllers/taskController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, getTasks);

router.get('/:id', auth, getTask);

router.post(
  '/',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('dueDate').isISO8601().withMessage('Valid due date is required'),
    body('assignedEmails').optional().isArray().withMessage('Assigned emails must be an array'),
  ],
  createTask
);

router.post('/:id/assign-by-email', auth, assignUserByEmail);

router.delete('/:id/unassign/:userId', auth, unassignUser);

router.put('/:id', auth, updateTask);

router.delete('/:id', auth, deleteTask);

router.patch('/:id/status', auth, updateTaskStatus);

router.patch('/:id/priority', auth, updateTaskPriority);

export default router;
