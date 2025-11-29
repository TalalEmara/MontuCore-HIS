const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Create a new case
 */
const createCase = async (caseData) => {
  const newCase = await prisma.case.create({
    data: {
      patientId: caseData.patientId,
      diagnosis: caseData.diagnosis,
      symptoms: caseData.symptoms,
      status: caseData.status || 'OPEN',
      priority: caseData.priority || 'MEDIUM',
      notes: caseData.notes,
      createdBy: caseData.createdBy
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return newCase;
};

/**
 * Get all cases with pagination and filters
 */
const getAllCases = async ({ page = 1, limit = 10, status }) => {
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};

  const [cases, total] = await Promise.all([
    prisma.case.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.case.count({ where })
  ]);

  return {
    cases,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get case by ID
 */
const getCaseById = async (caseId) => {
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      patient: true,
      appointments: true,
      sessions: true
    }
  });

  if (!caseData) {
    throw new Error('Case not found');
  }

  return caseData;
};

/**
 * Update case
 */
const updateCase = async (caseId, updates) => {
  const updatedCase = await prisma.case.update({
    where: { id: caseId },
    data: updates,
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return updatedCase;
};

/**
 * Delete case
 */
const deleteCase = async (caseId) => {
  await prisma.case.delete({
    where: { id: caseId }
  });

  return { message: 'Case deleted successfully' };
};

module.exports = {
  createCase,
  getAllCases,
  getCaseById,
  updateCase,
  deleteCase
};
