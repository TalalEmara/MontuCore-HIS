import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';
import { prisma } from '../../index.js';
// const prisma = new PrismaClient();

interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  role?: Role;
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
 * Register a new user
 */
export const register = async ({ email, password, fullName, role }: RegisterInput): Promise<AuthResponse> => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      fullName,
      role: role || Role.ATHLETE
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true
    }
  });

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );

  return { user, token };
};

/**
 * Login user
 */
export const login = async ({ email, password }: LoginInput): Promise<AuthResponse> => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    },
    token
  };
};

/**
 * Logout user
 */
export const logout = async (userId: number): Promise<{ message: string }> => {
  // Implement logout logic (e.g., token blacklisting if needed)
  return { message: 'Logged out successfully' };
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: number): Promise<UserResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};
