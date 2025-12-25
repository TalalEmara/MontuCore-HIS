import express, { Router } from 'express';
import * as sessionController from './session.controller';
import { authenticateToken } from '../../middleware/auth';

const router: Router = express.Router();

/**
 * @route   POST /api/sessions
 * @desc    Create a new session
 * @access  Private
 */
router.post('/', authenticateToken, sessionController.createSession);

/**
 * @route   GET /api/sessions
 * @desc    Get all sessions
 * @access  Private
 */
router.get('/', authenticateToken, sessionController.getAllSessions);

/**
 * @route   GET /api/sessions/:id
 * @desc    Get session by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, sessionController.getSessionById);

/**
 * @route   PUT /api/sessions/:id
 * @desc    Update session
 * @access  Private
 */
router.put('/:id', authenticateToken, sessionController.updateSession);

/**
 * @route   POST /api/sessions/:id/complete
 * @desc    Complete session
 * @access  Private
 */
router.post('/:id/complete', authenticateToken, sessionController.completeSession);

export default router;
