import { prisma } from '../../config/db.js';
import { uploadFile } from '../../storage/supabase.service.js';
import { validateRequired, validatePositiveInt, validateEnum } from '../../utils/validation.js';
import { NotFoundError, ValidationError } from '../../utils/AppError.js';

interface LabTestFilter {
  caseId?: number;
  athleteId?: number;
  status?: string;
  category?: string;
  dateRange?: { startDate: Date; endDate: Date };
  page?: number;
  limit?: number;
}

// Base: get lab tests with filters + pagination
export const getLabTests = async (filters: LabTestFilter = {}) => {
  try {
    const { caseId,
      athleteId,
      status,
      category,
      dateRange,
      page = 1,
      limit = 10 } = filters;

    const where: any = {};

    // Resolve athlete -> caseIds
    if (athleteId) {
      const cases = await prisma.case.findMany({
        where: { athleteId },
        select: { id: true }
      });
      const caseIds = cases.map(c => c.id);
      if (caseIds.length === 0) {
        return { labTests: [], pagination: { page, limit, total: 0, totalPages: 0 } };
      }
      where.caseId = { in: caseIds };
    } else if (caseId) {
      where.caseId = caseId;
    }

    if (status) where.status = status;
    if (category) where.category = category;
    if (dateRange) {
      where.sampleDate = {
        gte: dateRange.startDate,
        lte: dateRange.endDate
      };
    }

    const skip = (page - 1) * limit;

    const [labTests, total] = await Promise.all([
      prisma.labTest.findMany({
        where,
        select: {
          id: true,
          testName: true,
          category: true,
          status: true,
          resultPdfUrl: true,
          resultValues: true,
          labTechnicianNotes: true,
          sampleDate: true,
          cost: true,
          medicalCase: {
            select: { diagnosisName: true }
          }
        },
        orderBy: { sampleDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.labTest.count({ where })
    ]);

    return {
      labTests,
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
 * Convenience: get lab tests by athlete ID with full pagination
 */
export const getLabTestsByAthleteId = async (athleteId: number, page = 1, limit = 10) => {
  return getLabTests({ athleteId, page, limit });
};

/**
 * Convenience: get lab tests by case ID with full pagination
 */
export const getLabTestsByCaseId = async (caseId: number, page = 1, limit = 10) => {
  return getLabTests({ caseId, page, limit });
};

/**
 * Data interface for creating a lab test
 */
export interface CreateLabTestData {
  caseId: number;
  testName: string; // 'CBC', 'Lipid Profile', 'Blood Glucose', etc.
  category?: string; // 'Hematology', 'Chemistry', 'Microbiology', etc.
  status?: string; // Default: 'PENDING'
  resultPdfUrl?: string;
  resultValues?: any; // JSON object with test values
  labTechnicianNotes?: string;
  sampleDate?: Date;
  cost?: number;
  pdfFile?: { // Optional PDF file data
    buffer: Buffer;
    originalName: string;
  };
}

/**
 * Create a new lab test
 */
export const createLabTest = async (data: CreateLabTestData) => {
  // Validate required fields
  validateRequired(data, ['caseId', 'testName']);
  validatePositiveInt(data.caseId, 'caseId');

  // Validate status if provided
  if (data.status) {
    const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'];
    validateEnum(data.status, validStatuses, 'status');
  }

  // Validate case exists
  const caseExists = await prisma.case.findUnique({
    where: { id: data.caseId },
    select: { id: true, athleteId: true }
  });

  if (!caseExists) {
    throw new NotFoundError('Case not found');
  }

  // Validate cost if provided
  if (data.cost !== undefined && data.cost < 0) {
    throw new ValidationError('Cost must be a positive number');
  }

  // Create the lab test first
  const labTest = await prisma.labTest.create({
    data: {
      caseId: data.caseId,
      testName: data.testName,
      category: data.category || null,
      status: (data.status as any) || 'PENDING',
      resultPdfUrl: null, // Will be updated if PDF is provided
      resultValues: data.resultValues || null,
      labTechnicianNotes: data.labTechnicianNotes || null,
      sampleDate: data.sampleDate || new Date(),
      cost: data.cost || null
    },
    include: {
      medicalCase: {
        select: {
          id: true,
          diagnosisName: true,
          athlete: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      }
    }
  });

  // If PDF file is provided, upload it and update the lab test
  if (data.pdfFile) {
    try {
      const uploadResult = await uploadFile('medical-documents', `lab-tests/${labTest.id}_${Date.now()}_${data.pdfFile.originalName}`, data.pdfFile.buffer, 'application/pdf');

      // Update the lab test with the PDF URL
      await prisma.labTest.update({
        where: { id: labTest.id },
        data: { resultPdfUrl: uploadResult.publicUrl }
      });

      // Update the returned object with the PDF URL
      labTest.resultPdfUrl = uploadResult.publicUrl;
    } catch (uploadError) {
      console.error('Failed to upload PDF for lab test:', uploadError);
      // Don't fail the entire creation if PDF upload fails
      // The lab test is created successfully, just without the PDF
    }
  }
    try {
    const existingInvoice = await prisma.invoice.findFirst({
      where: { caseId: labTest.caseId }
    });

    if (existingInvoice) {
      // Add lab test to invoice JSON
      const items: any = existingInvoice.items || {};

      if (!items.labTests) items.labTests = [];

      items.labTests.push({
        id: labTest.id,
        type: 'Lab Test',
        description: labTest.testName,
        cost: labTest.cost || 0,
        status: labTest.status
      });

      // Recalculate subtotal
      const subtotal =
        (items.appointment?.cost || 0) +
        (items.exams?.reduce((s: any, e: { cost: any; }) => s + (e.cost || 0), 0) || 0) +
        (items.labTests?.reduce((s: any, l: { cost: any; }) => s + (l.cost || 0), 0) || 0) +
        (items.treatments?.reduce((s: any, t: { cost: any; }) => s + (t.cost || 0), 0) || 0) +
        (items.physioPrograms?.reduce((s: any, p: { cost: any; }) => s + (p.cost || 0), 0) || 0);

      await prisma.invoice.update({
        where: { id: existingInvoice.id },
        data: {
          items,
          subtotal,
          totalAmount: subtotal
        }
      });
    }
  } catch (err) {
    console.error("Failed updating invoice after lab test", err);
  }


  return labTest;
};

/**
 * Get lab test by ID
 */
export const getLabTestById = async (id: number) => {
  validatePositiveInt(id, 'id');

  const labTest = await prisma.labTest.findUnique({
    where: { id },
    include: {
      medicalCase: {
        select: {
          id: true,
          diagnosisName: true,
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

  if (!labTest) {
    throw new NotFoundError('Lab test not found');
  }

  return labTest;
};

/**
 * Update lab test
 */
export const updateLabTest = async (id: number, data: Partial<CreateLabTestData>) => {
  validatePositiveInt(id, 'id');

  // Check lab test exists
  const labTestExists = await prisma.labTest.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!labTestExists) {
    throw new NotFoundError('Lab test not found');
  }

  // Validate status if provided
  if (data.status) {
    const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED'];
    validateEnum(data.status, validStatuses, 'status');
  }

  const updatedLabTest = await prisma.labTest.update({
    where: { id },
    data: {
      ...(data.testName && { testName: data.testName }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.status && { status: data.status as any }),
      ...(data.resultPdfUrl !== undefined && { resultPdfUrl: data.resultPdfUrl }),
      ...(data.resultValues !== undefined && { resultValues: data.resultValues }),
      ...(data.labTechnicianNotes !== undefined && { labTechnicianNotes: data.labTechnicianNotes }),
      ...(data.sampleDate !== undefined && { sampleDate: data.sampleDate }),
      ...(data.cost !== undefined && { cost: data.cost })
    },
    include: {
      medicalCase: {
        select: {
          diagnosisName: true
        }
      }
    }
  });

  return updatedLabTest;
};

/**
 * Upload PDF result for a lab test
 */
export const uploadLabTestPdf = async (id: number, fileBuffer: Buffer, originalName: string) => {
  validatePositiveInt(id, 'id');

  // Check lab test exists
  const labTest = await prisma.labTest.findUnique({
    where: { id },
    select: { id: true, resultPdfUrl: true }
  });

  if (!labTest) {
    throw new NotFoundError('Lab test not found');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const fileName = `lab-tests/${id}_${timestamp}_${originalName}`;

  // Upload to Supabase
  const uploadResult = await uploadFile('medical-documents', fileName, fileBuffer, 'application/pdf');

  // Update lab test with the URL
  const updatedLabTest = await prisma.labTest.update({
    where: { id },
    data: { resultPdfUrl: uploadResult.publicUrl },
    include: {
      medicalCase: {
        select: {
          diagnosisName: true
        }
      }
    }
  });

  return updatedLabTest;
};
