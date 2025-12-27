import express, { Router } from 'express';
import * as authController from './auth.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router: Router = express.Router();


/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
*/
router.post('/login', authController.login);

/**
 * @route POST /api/auth/register
 * @desc Register user
 * @access Public
*/
router.post('/register', authController.register);


/**
 * @route GET /api/auth/logout
 * @desc Logout user
 * @access Public
*/
router.get('/logout', authController.logout);

/**
 * @route GET /api/auth/getAllUsers
 * @desc Get all users
 * @access Public
*/
router.get('/getAllUsers', authController.getAllUsers);

/**
 * @route GET /api/auth/getAllAthletes
 * @desc Get all athletes
 * @access Public
*/
router.get('/getAllAthletes', authController.getAllAthletes);

/**
 * @route GET /api/auth/getAllClinicians
 * @desc Get all clinicians
 * @access Public
*/
router.get('/getAllClinicians', authController.getAllClinicians);

/**
 * @route GET /api/auth/getUserById/:id
 * @desc Get a specific user by ID
 * @access Public
*/
router.get('/getUserById/:id', authController.getUserById);

/**
 * @route POST /api/auth/updateAthlete
 * @desc Update a specific athlete profile
 * @access Public
*/
router.post('/updateAthlete', authController.updateAthleteProfile);

/**
 * @route POST /api/auth/updateAthlete
 * @desc Update a specific athlete profile
 * @access Public
*/
router.post('/updateAthlete', authController.updateAthleteProfile);

/**
 * @route DELETE /api/auth/deleteUser/:id
 * @desc Delete a specific user by ID
 * @access Public
*/
router.delete('/deleteUser/:id', authController.deleteUser);


// /**
//  * @route   POST /api/auth/register
//  * @desc    Register a new user
//  * @access  Public
//  */
// router.post('/register', authController.register);

// /**
//  * @route   POST /api/auth/login
//  * @desc    Login user
//  * @access  Public
//  */
// router.post('/login', authController.login);

// /**
//  * @route   POST /api/auth/logout
//  * @desc    Logout user
//  * @access  Private
//  */
// router.post('/logout', authenticateToken, authController.logout);

// /**
//  * @route   GET /api/auth/profile
//  * @desc    Get current user profile
//  * @access  Private
//  */
// router.get('/profile', authenticateToken, authController.getProfile);

export default router;
