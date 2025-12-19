import type { Request, Response } from 'express';
import * as authService from './auth.service.js';
import jwt from 'jsonwebtoken';
/**
 * Register a new user
 */

export const login = async (req: Request, res: Response): Promise<void> => {
  try{
    const loginData = req.body;
    const result = await authService.login(loginData);
    
    res.status(200).json({
      result
    });
  }
  catch(error){
    if (error instanceof Error && error.message === 'Invalid credentials'){
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: error
    });
  }
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try{
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')  
      ? authHeader.substring(7) 
      : authHeader;

      const verified= jwt.verify(userToken!, process.env.JWT_SECRET!);
      if (verified && (verified as any).role === 'ADMIN'){
        const registerData = req.body;
        const result = await authService.reigster(registerData);
        res.status(201).json({
          result
        });
        return;
      }
      else{
        res.status(403).json({
          success: false,
          message: 'Only admin users can register new users'
        });
        return;
      }
  }
  catch(error){
    // Handle JWT errors
    if (error instanceof Error) {
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
        return;
      }
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          message: 'Token expired'
        });
        return;
      }
    }
    res.status(500).json({
      success: false,
      message: "error"
    });
  }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
  try{
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')  
      ? authHeader.substring(7) 
      : authHeader;

    const verified= jwt.verify(userToken!, process.env.JWT_SECRET!);
    if (verified){
      const userId = parseInt(req.query.id as string);  
      const result = await authService.logout(userToken!, userId);
      res.status(200).json({
        result
      });
    }
    
  }
  catch(error){
    if (error instanceof Error) {
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
        return;
      }
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          message: 'Token expired'
        });
        return;
      }
      if (error.message === 'Token does not belong to the user'){
      res.status(401).json({
        success: false,
        message: 'Invalid Token'
      });
      return;
    }
    }
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred during logout'
    });
  }
}



// export const register = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { email, password, fullName, role } = req.body;
    
//     const result = await authService.register({ email, password, fullName, role });
    
//     res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       data: result
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };

// /**
//  * Login user
//  */
// export const login = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { email, password } = req.body;
    
//     const result = await authService.login({ email, password });
    
//     res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       data: result
//     });
//   } catch (error) {
//     res.status(401).json({
//       success: false,
//       message: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };

// /**
//  * Logout user
//  */
// export const logout = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const userId = (req as any).user.id;
    
//     await authService.logout(userId);
    
//     res.status(200).json({
//       success: true,
//       message: 'Logout successful'
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };

// /**
//  * Get current user profile
//  */
// export const getProfile = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const userId = (req as any).user.id;
    
//     const user = await authService.getUserById(userId);
    
//     res.status(200).json({
//       success: true,
//       data: user
//     });
//   } catch (error) {
//     res.status(404).json({
//       success: false,
//       message: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };
