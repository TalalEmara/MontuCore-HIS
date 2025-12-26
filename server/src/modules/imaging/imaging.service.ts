import { prisma } from '../../config/db.js';
import { ExamStatus } from '@prisma/client';

interface ImagingOrderData {
  caseId: number;
  modality: string;
  bodyPart: string;
  radiologistNotes?: string;
  conclusion?: string;
  status?: ExamStatus;
  cost?: number;
  scheduledAt?: string;
  performedAt?: string;
}

interface GetAllOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  caseId?: number | undefined;
}

interface UploadResultsData {
  radiologistNotes?: string;
  conclusion?: string;
  performedAt?: Date;
}

/**
 * Create a new imaging order
 */
export const createImagingOrder = async (orderData: ImagingOrderData) => {
  const newOrder = await prisma.exam.create({
    data: {
      caseId: orderData.caseId,
      modality: orderData.modality,
      bodyPart: orderData.bodyPart,
      radiologistNotes: orderData.radiologistNotes ?? null,
      conclusion: orderData.conclusion ?? null,
      status: orderData.status || 'ORDERED',
      cost: orderData.cost ?? null,
      scheduledAt: orderData.scheduledAt ? new Date(orderData.scheduledAt) : null,
      performedAt: orderData.performedAt ? new Date(orderData.performedAt) : null
    },
    include: {
      medicalCase: {
        include: {
          athlete: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      }
    }
  });

  return newOrder;
};

/**
 * Get all imaging orders with pagination and filters
 */
export const getAllImagingOrders = async ({ page = 1, limit = 10, status, caseId }: GetAllOrdersParams) => {
  const skip = (page - 1) * limit;
  const where: any = {};
  
  if (status) where.status = status;
  if (caseId) where.caseId = caseId;

  const [orders, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      skip,
      take: limit,
      include: {
        medicalCase: {
          include: {
            athlete: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        },
        images: true
      },
      orderBy: {
        scheduledAt: 'desc'
      }
    }),
    prisma.exam.count({ where })
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get imaging order by ID
 */
export const getImagingOrderById = async (orderId: number) => {
  const order = await prisma.exam.findUnique({
    where: { id: orderId },
    include: {
      medicalCase: {
        include: {
          athlete: true
        }
      },
      images: true
    }
  });

  if (!order) {
    throw new Error('Imaging order not found');
  }

  return order;
};

/**
 * Update imaging order
 */
export const updateImagingOrder = async (orderId: number, updates: Partial<ImagingOrderData>) => {
  const updatedOrder = await prisma.exam.update({
    where: { id: orderId },
    data: updates as any,
    include: {
      medicalCase: {
        include: {
          athlete: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      }
    }
  });

  return updatedOrder;
};

/**
 * Upload imaging results
 */
export const uploadImagingResults = async (orderId: number, { radiologistNotes, conclusion, performedAt }: UploadResultsData) => {
  const updatedOrder = await prisma.exam.update({
    where: { id: orderId },
    data: {
      radiologistNotes: radiologistNotes ?? null,
      conclusion: conclusion ?? null,
      status: 'COMPLETED',
      performedAt: performedAt || new Date()
    },
    include: {
      medicalCase: {
        include: {
          athlete: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      }
    }
  });

  return updatedOrder;
};
