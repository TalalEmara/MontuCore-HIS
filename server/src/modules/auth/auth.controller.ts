import type { Request, Response } from 'express';
import * as authService from './auth.service.js';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db.js';
/**
 * Register a new user
 */


export const isAdmin = async (token: string)=> {
  try{
    const verified= jwt.verify(token, process.env.JWT_SECRET!);
    if (verified && (verified as any).role === 'ADMIN'){
      return true;
    }
    return false;
  }
  catch(error){
    throw error;
  }
}

export const isAthlete = async (token: string)=> {
  try{
    const verified= jwt.verify(token, process.env.JWT_SECRET!);
    if (verified && (verified as any).role === 'ATHLETE'){
      return true;
    }
    return false;
  }
  catch(error){
    throw error;
  }
}

export const isClinician = async (token: string)=> {
  try{
    const verified= jwt.verify(token, process.env.JWT_SECRET!);
    if (verified && (verified as any).role === 'CLINICIAN'){
      return true;
    }
    return false;
  }
  catch(error){
    throw error;
  }
}

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

    const isUserAdmin = await isAdmin(userToken!);
    
    if (!isUserAdmin){
      res.status(403).json({
        success: false,
        message: 'Only admin users can register new users'
      });
      return;
    }

    const { generalData, userData } = req.body;
    
    // Validate required fields
    if (!generalData?.email || !generalData?.password || !generalData?.fullName || !generalData?.role) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields in GeneralData'
      });
      return;
    }
    
    // Construct the registerData object that matches RegisterInput interface
    const registerData = {
      email: generalData.email,
      password: generalData.password,
      fullName: generalData.fullName,
      role: generalData.role,
      dob: new Date(generalData.dob),
      gender: generalData.gender
    };
    
    const registerResult = await authService.reigster(registerData);

    //Create Athlete Profile.
    if (generalData.role === 'ATHLETE'){
      // Validate athlete-specific data
      if (!userData?.position || userData?.jerseyNumber === undefined) {
        await prisma.user.delete({
          where: { id: registerResult.user.id }
        });
        res.status(400).json({
          success: false,
          message: 'Missing required athlete data (position, jerseyNumber)'
        });
        return;
      }

      const existingAthlete = await prisma.athleteProfile.findFirst({ 
        where: { 
          jerseyNumber: userData.jerseyNumber
        } 
      });
      
      if (userData.jerseyNumber < 0 || userData.jerseyNumber > 99 || existingAthlete){
        await prisma.user.delete({
          where: {
            id: registerResult.user.id
          }
        });
        res.status(400).json({
          success: false,
          message: 'Invalid or duplicate jersey number'
        });
        return;
      }
      
      const athlete = await prisma.athleteProfile.create({
        data: {
          userId :  registerResult.user.id,
          position: userData.position,
          jerseyNumber: userData.jerseyNumber,
        }
      });
      
      if (!athlete){
        await prisma.user.delete({
          where: {
            id: registerResult.user.id
          }
        });
        res.status(500).json({
          success: false,
          message: 'Athlete profile creation failed'
        });
        return;
      }
    }

    // Handle CLINICIAN role
    if (generalData.role === 'CLINICIAN'){
      if (!userData?.specialty) {
        await prisma.user.delete({
          where: { id: registerResult.user.id }
        });
        res.status(400).json({
          success: false,
          message: 'Missing required clinician data (specialty)'
        });
        return;
      }

      const clinician = await prisma.clinicianProfile.create({
        data: {
          userId: registerResult.user.id,
          specialty: userData.specialty,
        }
      });

      if (!clinician){
        await prisma.user.delete({
          where: { id: registerResult.user.id }
        });
        res.status(500).json({
          success: false,
          message: 'Clinician profile creation failed'
        });
        return;
      }
    }

    res.status(201).json({
      "success": true,
      "token" : registerResult.token
    });
    return;
  }

  catch(error){
    console.error('Registration error:', error); // Add logging to see the actual error
    
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
      if (error.message === 'User with this email already exists') {
        res.status(409).json({
          success: false,
          message: error.message
        });
        return;
      }
      if (error.message === 'Date of birth cannot be in the future') {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
    }
    
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred during registration'
    });
  }
}

export const updateAthleteProfile = async (req: Request, res: Response): Promise<void> => {
  try{
    const athleteData = req.body;
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')  
      ? authHeader.substring(7) 
      : authHeader;
    const isUserAthlete = await isAthlete(userToken!);
    const isUserAdmin = await isAdmin(userToken!);
    if (!isUserAthlete && !isUserAdmin){
      res.status(403).json({
        success: false,
        message: 'Only athlete or admin users can update athlete profiles'
      });
      return;
    }

    const result = await authService.updateAthleteProfile(athleteData.userId, athleteData.position, athleteData.jerseyNumber);
    if (!result){
      res.status(400).json({
        success: false,
        message: 'Athlete profile update failed'
    });
    }
    res.status(200).json({
      success: true,
      message: 'Athlete profile updated successfully'
    });
  }
  catch(error){
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred during athlete profile update'
    });
  }
}


export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try{
    const userId = parseInt(req.params.id as string);
    const userToken = req.headers['authorization']?.toString().replace('Bearer ', '') || '';
    const isUserAdmin = await isAdmin(userToken);
    
    if (!isUserAdmin){
      res.status(403).json({
        success: false,
        message: 'Only admin users can delete users'
      });
      return;
    }

    const result = await authService.deleteUser(userId);
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  }
  catch(error){
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred during user deletion'
    });
  }
};

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


export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try{
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')  
      ? authHeader.substring(7) 
      : authHeader;
    const isUserAdmin = await isAdmin(userToken!);
    
    if (isUserAdmin){
      const users =  await authService.getAllUsers();
      res.status(200).json({
        users
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

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try{
    const authHeader = req.headers['authorization'] || '';
    const userToken = authHeader.startsWith('Bearer ')  
      ? authHeader.substring(7) 
      : authHeader;
    const isUserAdmin = await isAdmin(userToken!);

    const userId = userToken ? (jwt.decode(userToken) as any).id : null;
    if (isUserAdmin || userId === parseInt(req.params.id as string)){
      const user =  await authService.getUserById(parseInt(req.params.id as string));
      res.status(200).json({
        user
      });
      return;
    }
    else{
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
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
      if (error.message === 'User not found'){
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }
    }
  }
  res.status(500).json({
    success: false,
    message: "error"
  });
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
