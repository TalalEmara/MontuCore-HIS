import { Router } from 'express';
import { getUserProfile } from './user.controller.js';
import { mockAuthMiddleware } from '../../middleware/autrhMiddleware.js';

const router: Router = Router();

// Apply middleware to all routes in this router
router.use(mockAuthMiddleware);

// GET /api/users/profile/:id
router.get('/profile/:id', getUserProfile);

export default router;