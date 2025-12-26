import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../../config/db.js';

interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  role: Role;
  dob: Date; // Handle it to be not in the future
  gender: string

}

interface LoginInput {
  email: string;
  password: string;
}

interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  createdAt?: Date;
}

interface AuthResponse {
  user: UserResponse;
  token: string;
}


/**
 * Register (By admin only)
 * Email
 * Password
 * Full Name
 * CreatedAt
 * DOB
 * Role (Athlete, Clinician, Admin)
 *        and its information
 * gender
 */


/**
 * Register a new user
 */
export const login = async (loginData : LoginInput) => {
  try{
    const user = await prisma.user.findUnique({
      where:{
        email: loginData.email
      }
    })
    if (!user){
      throw new Error('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(loginData.password, user.passwordHash);
    if (!isPasswordValid){
      throw new Error('Invalid credentials');
    }

    const token = generateJWT(user.id, user.email, user.role);
    return {
      "token": token,
      "sucess": true
    }
  }
  catch(error){
    throw error instanceof Error ? error.message : 'Unknown error occurred';
  }
}

export const reigster = async (registerData : RegisterInput) => {
  try{
    const exitedUser = await prisma.user.findUnique({
      where:{
        email: registerData.email
      }
    });
    if (exitedUser){
      throw new Error('User with this email already exists');
    }
    if (new Date(registerData.dob) > new Date()){
      throw new Error('Date of birth cannot be in the future');
    }

    const hashedPassword = await bcrypt.hash(registerData.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: registerData.email,
        passwordHash: hashedPassword,
        fullName: registerData.fullName,
        role: registerData.role,
        createdAt: new Date(),
        dateOfBirth: registerData.dob,
        gender: registerData.gender
      }
    })

    if (!newUser){
      throw new Error('User registration failed');
    }

    const token = generateJWT(newUser.id, newUser.email, newUser.role);
    return {
      "token": token,
      "success": true,
      "user" : newUser
    };
  }
  catch(error){
    if (error instanceof Error) {
      throw error; 
    }
    throw new Error('Something went wrong during registration process');
  }
}



export const logout = async (token: string, userId: number) => {
  try {
    const decoded = jwt.decode(token) as any;
    const expiresAt = new Date(decoded.exp * 1000);

    if (decoded.id !== userId) {
      throw new Error('Token does not belong to the user');
    }
  
    await prisma.revokedToken.create({
      data: {
        token,
        userId,
        expiresAt
      }
    });

    return { message: 'Logged out successfully' };
  
  } catch (error) {
    throw error;
  }
};

export const updateAthleteProfile = async (userId: number, position: string, jerseyNumber: number) => {
  try{
    const existingAthlete = await prisma.user.findFirst({ 
      where: { 
        id: userId,
        role: 'ATHLETE'
      } 
    });
    if (!existingAthlete){
      throw new Error('Athlete profile not found for the user');
    }
    const duplicateJersey = await prisma.athleteProfile.findFirst({
      where: {
        jerseyNumber: jerseyNumber,
        NOT: {
          userId: existingAthlete.id
        }
      }
    });
    if (duplicateJersey){
      throw new Error('Jersey number already in use by another athlete');
    }
    const updatedAthlete = await prisma.athleteProfile.update({
      where: {
        userId: existingAthlete.id
      },
      data: {
        position: position,
        jerseyNumber: jerseyNumber
      }
    });
    return updatedAthlete;
  }

  catch(error){
    if (error instanceof Error) {
      throw error; 
    }
    throw "Something went wrong during updating athlete profile";
  }
}


export const deleteUser = async (userId: number) => {
  try{
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        athleteProfile: true,
        clinicianProfile: true,
      }
    });

    if (!user) {
      throw new Error('User not found');
    }
    if (user.athleteProfile) {
      await prisma.athleteProfile.delete({
        where: { userId: userId }
      });
    }

    if (user.clinicianProfile) {
      await prisma.clinicianProfile.delete({
        where: { userId: userId }
      });
    }
    const deletedUser = await prisma.user.delete({
      where: {
        id: userId
      }
    });
    return true;
  }
  catch(error){
    if (error instanceof Error) {
      throw error; 
    }
    throw new Error("Something went wrong during deleting user");
  }
};

export const isTokenRevoked = async (token: string): Promise<boolean> => {
  const revokedToken = await prisma.revokedToken.findUnique({
    where: { token }
  });
  return !!revokedToken;
};


export const generateJWT = (userId : number, email: string, role: Role) => {
  const token = jwt.sign(
    { id: userId, email: email, role: role },
    process.env.JWT_SECRET!,
    { expiresIn: '72h' }
  );

  return token;
}


export const getAllUsers = async () => {
  try{
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true
      }
    });
    return users;
  }
  catch(error){
    throw "Something went wrong during fetching users";
  }
}

export const getUserById = async (userId: number) => {
  try{
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true
      }
    });
    if (user === null){
      throw new Error('User not found');
    }
    return user;
  }
  catch(error){
    throw "Something went wrong during fetching user by ID";
  }
};