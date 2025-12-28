import { prisma } from '../../config/db.js';

interface PhysioProgramData {
  caseId: number;
  title: string;
  numberOfSessions: number;
  startDate: string; // ISO string
  weeklyRepetition: number;
  costPerSession?: number;
}

interface UpdatePhysioProgramData {
  title?: string;
  numberOfSessions?: number;
  sessionsCompleted?: number;
  startDate?: string; // ISO string
  weeklyRepetition?: number;
  costPerSession?: number;
}

interface GetPhysioProgramsFilterParams {
  caseId?: number;
  clinicianId?: number;
  page?: number;
  limit?: number;
}

/**
 * Create a new physio program
 */
export const createPhysioProgram = async (programData: PhysioProgramData) => {
  try {
    const newProgram = await prisma.physioProgram.create({
      data: {
        caseId: programData.caseId,
        title: programData.title,
        numberOfSessions: programData.numberOfSessions,
        startDate: new Date(programData.startDate),
        weeklyRepetition: programData.weeklyRepetition,
        costPerSession: programData.costPerSession ?? null,
      },
      include: {
        medicalCase: {
          select: {
            id: true,
            diagnosisName: true,
            athlete: {
              select: {
                id: true,
                fullName: true,
              }
            }
          }
        }
      }
    });

    return newProgram;
  } catch (error) {
    throw error;
  }
};

/**
 * Get physio program by ID
 */
export const getPhysioProgramById = async (programId: number) => {
  try {
    const program = await prisma.physioProgram.findUnique({
      where: { id: programId },
      include: {
        medicalCase: {
          select: {
            id: true,
            diagnosisName: true,
            athlete: {
              select: {
                id: true,
                fullName: true,
              }
            },
            managingClinician: {
              select: {
                id: true,
                fullName: true,
              }
            }
          }
        }
      }
    });

    if (!program) {
      throw new Error('Physio program not found');
    }

    return program;
  } catch (error) {
    throw error;
  }
};

/**
 * FLEXIBLE BASE FUNCTION - Get physio programs with multiple filter options
 * Supports: caseId, clinicianId, pagination
 * @example getPhysioPrograms({ caseId: 1 })
 * @example getPhysioPrograms({ clinicianId: 2, page: 1, limit: 10 })
 */
export const getPhysioPrograms = async (filters: GetPhysioProgramsFilterParams = {}) => {
  try {
    const { caseId, clinicianId, page = 1, limit = 10 } = filters;

    const where: any = {};
    if (caseId) where.caseId = caseId;
    if (clinicianId) where.medicalCase = { managingClinicianId: clinicianId };

    const skip = (page - 1) * limit;

    const [programs, total] = await Promise.all([
      prisma.physioProgram.findMany({
        where,
        select: {
          id: true,
          title: true,
          numberOfSessions: true,
          sessionsCompleted: true,
          startDate: true,
          weeklyRepetition: true,
          costPerSession: true,
          medicalCase: {
            select: {
              id: true,
              diagnosisName: true,
              athlete: {
                select: {
                  id: true,
                  fullName: true,
                }
              },
              managingClinician: {
                select: {
                  id: true,
                  fullName: true,
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          startDate: 'desc'
        }
      }),
      prisma.physioProgram.count({ where })
    ]);

    return {
      programs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get all physio programs (admin only)
 */
export const getAllPhysioPrograms = async (page: number = 1, limit: number = 10) => {
  try {
    const result = await getPhysioPrograms({ page, limit });
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all physio programs for a case
 */
export const getPhysioProgramsByCaseId = async (caseId: number) => {
  try {
    const result = await getPhysioPrograms({ caseId });
    return result.programs;
  } catch (error) {
    throw error;
  }
};

/**
 * Update physio program
 */
export const updatePhysioProgram = async (programId: number, updates: UpdatePhysioProgramData) => {
  try {
    const existingProgram = await prisma.physioProgram.findUnique({
      where: { id: programId }
    });

    if (!existingProgram) {
      throw new Error('Physio program not found');
    }

    // Filter out undefined fields
    const filteredUpdates: any = {};
    if (updates.title !== undefined) filteredUpdates.title = updates.title;
    if (updates.numberOfSessions !== undefined) filteredUpdates.numberOfSessions = updates.numberOfSessions;
    if (updates.sessionsCompleted !== undefined) filteredUpdates.sessionsCompleted = updates.sessionsCompleted;
    if (updates.startDate !== undefined) filteredUpdates.startDate = new Date(updates.startDate);
    if (updates.weeklyRepetition !== undefined) filteredUpdates.weeklyRepetition = updates.weeklyRepetition;
    if (updates.costPerSession !== undefined) filteredUpdates.costPerSession = updates.costPerSession;

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error('No fields to update');
    }

    const updatedProgram = await prisma.physioProgram.update({
      where: { id: programId },
      data: filteredUpdates,
      include: {
        medicalCase: {
          select: {
            id: true,
            diagnosisName: true,
            athlete: {
              select: {
                id: true,
                fullName: true,
              }
            }
          }
        }
      }
    });

    return updatedProgram;
  } catch (error) {
    throw error;
  }
};

/**
 * Update sessions completed
 */
export const updateSessionsCompleted = async (programId: number, sessionsCompleted: number) => {
  try {
    const program = await prisma.physioProgram.findUnique({
      where: { id: programId }
    });

    if (!program) {
      throw new Error('Physio program not found');
    }

    if (sessionsCompleted < 0 || sessionsCompleted > program.numberOfSessions) {
      throw new Error('Invalid sessions completed count');
    }

    const updatedProgram = await prisma.physioProgram.update({
      where: { id: programId },
      data: { sessionsCompleted },
      include: {
        medicalCase: {
          select: {
            id: true,
            diagnosisName: true,
            athlete: {
              select: {
                id: true,
                fullName: true,
              }
            }
          }
        }
      }
    });

    return updatedProgram;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete physio program
 */
export const deletePhysioProgram = async (programId: number) => {
  try {
    const program = await prisma.physioProgram.findUnique({
      where: { id: programId }
    });

    if (!program) {
      throw new Error('Physio program not found');
    }

    await prisma.physioProgram.delete({
      where: { id: programId }
    });

    return { message: 'Physio program deleted successfully' };
  } catch (error) {
    throw error;
  }
};

/**
 * Get physio programs by clinician (for managing clinician)
 */
export const getPhysioProgramsByClinicianId = async (clinicianId: number) => {
  try {
    const result = await getPhysioPrograms({ clinicianId });
    return result.programs;
  } catch (error) {
    throw error;
  }
};