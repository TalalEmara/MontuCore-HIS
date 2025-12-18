import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../../index.js'
// const prisma = new PrismaClient();

/**
 * Get user by ID along with profile
 */
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;

    if (!idParam) {
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }

    const userId = parseInt(idParam, 10);

    if (isNaN(userId)) {
      res.status(400).json({ success: false, message: 'User ID must be a valid number' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        athleteProfile: true,
        clinicianProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};