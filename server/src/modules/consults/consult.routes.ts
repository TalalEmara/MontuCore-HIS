import { Router } from 'express';
import { generateShareLink, viewSharedRecord } from './consult.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router : Router = Router();

// 1. Protected Route: Create Link
// Only logged-in users (Clinicians) can hit this
router.post('/share', authenticateToken, generateShareLink);

// 2. Public Route: View Data
// No 'protect' middleware here. The token in the URL validates access.
router.get('/view/:token', viewSharedRecord);

export default router;