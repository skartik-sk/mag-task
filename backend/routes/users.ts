import { Router } from 'express';
import { searchUsers, assignUserToTask, removeUserFromTask } from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/search', auth, searchUsers);

router.post('/tasks/:id/assign', auth, assignUserToTask);

router.delete('/tasks/:id/assign/:userId', auth, removeUserFromTask);

export default router;
