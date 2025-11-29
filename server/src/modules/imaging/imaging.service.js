const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Create a new imaging order
 */
const createImagingOrder = async (orderData) => {
  const newOrder = await prisma.pacsOrder.create({
    data: {
      patientId: orderData.patientId,
      caseId: orderData.caseId,
      modalityType: orderData.modalityType,
      bodyPart: orderData.bodyPart,
      clinicalIndication: orderData.clinicalIndication,
      urgency: orderData.urgency || 'ROUTINE',
      status: orderData.status || 'PENDING',
      orderedBy: orderData.orderedBy,
      scheduledDate: orderData.scheduledDate ? new Date(orderData.scheduledDate) : null
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      case: {
        select: {
          id: true,
          diagnosis: true
        }
      }
    }
  });

  return newOrder;
};

/**
 * Get all imaging orders with pagination and filters
 */
const getAllImagingOrders = async ({ page = 1, limit = 10, status, patientId }) => {
  const skip = (page - 1) * limit;
  const where = {};
  
  if (status) where.status = status;
  if (patientId) where.patientId = patientId;

  const [orders, total] = await Promise.all([
    prisma.pacsOrder.findMany({
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
        },
        case: {
          select: {
            id: true,
            diagnosis: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.pacsOrder.count({ where })
  ]);

  return {
    orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get imaging order by ID
 */
const getImagingOrderById = async (orderId) => {
  const order = await prisma.pacsOrder.findUnique({
    where: { id: orderId },
    include: {
      patient: true,
      case: true
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
const updateImagingOrder = async (orderId, updates) => {
  const updatedOrder = await prisma.pacsOrder.update({
    where: { id: orderId },
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

  return updatedOrder;
};

/**
 * Upload imaging results
 */
const uploadImagingResults = async (orderId, { results, dicomUrl, reportUrl }) => {
  const updatedOrder = await prisma.pacsOrder.update({
    where: { id: orderId },
    data: {
      results,
      dicomUrl,
      reportUrl,
      status: 'COMPLETED',
      completedDate: new Date()
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

  return updatedOrder;
};

module.exports = {
  createImagingOrder,
  getAllImagingOrders,
  getImagingOrderById,
  updateImagingOrder,
  uploadImagingResults
};
