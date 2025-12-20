import { Router } from 'express';
import { generateShareLink, viewSharedRecord } from './consult.controller.js';
// import { protect } from '../../middleware/autrhMiddleware.js'; 

const router : Router = Router();

// 1. Protected Route: Create Link
// Only logged-in users (Clinicians) can hit this
router.post('/share', generateShareLink); // add protect,

// 2. Public Route: View Data
// No 'protect' middleware here. The token in the URL validates access.
router.get('/view/:token', viewSharedRecord);

export default router;