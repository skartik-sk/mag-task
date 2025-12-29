import { Router } from 'express';
import { searchUsers, assignUserToTask, removeUserFromTask } from '../controllers/userController';
import { auth } from '../middleware/auth';
const router = Router();
router.get('/search', auth, searchUsers);
router.post('/tasks/:id/assign', auth, assignUserToTask);
router.delete('/tasks/:id/assign/:userId', auth, removeUserFromTask);
export default router;
