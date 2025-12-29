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
  ],
  createTask
);

router.put('/:id', auth, updateTask);

router.delete('/:id', auth, deleteTask);

router.patch('/:id/status', auth, updateTaskStatus);

router.patch('/:id/priority', auth, updateTaskPriority);

export default router;
