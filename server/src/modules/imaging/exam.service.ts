import { prisma } from '../../config/db.js';
import { validateRequired, validatePositiveInt, validateEnum } from '../../utils/validation.js';
import { NotFoundError, ValidationError } from '../../utils/AppError.js';
import { ExamStatus } from '@prisma/client';
import { supabase, getPublicUrl } from '../../storage/supabase.service.js';
import dicomParser from 'dicom-parser';

// Extend Express Request for file uploads
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// DICOM parsing helpers
const parseDicomDate = (dateString: string | undefined): Date => {
  if (!dateString || dateString.length !== 8) {
    return new Date(); // Fallback to "now" if missing or invalid
  }
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  return new Date(`${year}-${month}-${day}`);
};

const parseDicomMetadata = (buffer: Buffer) => {
  const byteArray = new Uint8Array(buffer);
  const dataSet = dicomParser.parseDicom(byteArray);

  return {
    patientName: dataSet.string('x00100010'),
    studyDate: dataSet.string('x00080020'),
    modality: dataSet.string('x00080060'),
    bodyPart: dataSet.string('x00180015'),
    studyInstanceUid: dataSet.string('x0020000d')
  };
};

interface ExamFilters {
  caseId?: number;
  athleteId?: number;
  modality?: string;
  status?: string;
  dateRange?: { startDate: Date; endDate: Date };
  isToday?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Base: get exams with flexible filters + pagination
 */
export const getExams = async (filters: ExamFilters = {}) => {
  const {
    caseId,
    athleteId,
    modality,
    status,
    dateRange,
    isToday,
    page = 1,
    limit = 10
  } = filters;

  const where: any = {};

  // Resolve athlete -> caseIds if provided
  if (athleteId) {
    const cases = await prisma.case.findMany({
      where: { athleteId },
      select: { id: true }
    });
    const caseIds = cases.map(c => c.id);
    if (caseIds.length === 0) {
      return { exams: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }
    where.caseId = { in: caseIds };
  } else if (caseId) {
    where.caseId = caseId;
  }

  if (modality) where.modality = modality;
  if (status) where.status = status;

  if (isToday) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    where.performedAt = { gte: startOfDay, lte: endOfDay };
  } else if (dateRange) {
    where.performedAt = { gte: dateRange.startDate, lte: dateRange.endDate };
  }

  const skip = (page - 1) * limit;

  const [exams, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      select: {
        id: true,
        modality: true,
        bodyPart: true,
        status: true,
        scheduledAt: true,
        performedAt: true,
        radiologistNotes: true,
        conclusion: true,
        dicomFileName: true,
        dicomPublicUrl: true,
        dicomUploadedAt: true,
        medicalCase: {
          select: { diagnosisName: true }
        }
      },
      orderBy: { performedAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.exam.count({ where })
  ]);

  return {
    exams,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/** Convenience: exams for athlete with full pagination */
export const getExamsByAthleteId = async (athleteId: number, page = 1, limit = 10) => {
  return getExams({ athleteId, page, limit });
};

/** Convenience: exams for a case with full pagination */
export const getExamsByCaseId = async (caseId: number, page = 1, limit = 10) => {
  return getExams({ caseId, page, limit });
};

/**
 * Data interface for creating an exam
 */
export interface CreateExamData {
  caseId: number;
  modality: string; // 'MRI', 'CT', 'X-RAY', 'Ultrasound'
  bodyPart: string; // 'Knee', 'Shoulder', 'Head', etc.
  status?: ExamStatus; // Default: 'ORDERED'
  scheduledAt?: Date;
  performedAt?: Date;
  radiologistNotes?: string;
  conclusion?: string;
  cost?: number;
  dicomFile?: Express.Multer.File; // Optional DICOM file
}

/**
 * Create a new exam
 */
export const createExam = async (data: CreateExamData) => {
  // Validate required fields
  validateRequired(data, ['caseId', 'modality', 'bodyPart']);
  validatePositiveInt(data.caseId, 'caseId');

  // Validate modality
  const validModalities = ['MRI', 'CT', 'X-RAY', 'Ultrasound', 'PET', 'DEXA'];
  validateEnum(data.modality, validModalities, 'modality');

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

  // Determine final status
  let finalStatus = data.status || 'ORDERED';
  if (data.dicomFile) {
    finalStatus = 'COMPLETED'; // DICOM upload auto-completes
  }

  // Validate status rules
  if (finalStatus === 'COMPLETED' && !data.dicomFile) {
    throw new ValidationError('COMPLETED exams must have a DICOM file');
  }

  // Create the exam
  const exam = await prisma.exam.create({
    data: {
      caseId: data.caseId,
      modality: data.modality,
      bodyPart: data.bodyPart,
      status: finalStatus,
      scheduledAt: data.scheduledAt || null,
      performedAt: data.performedAt || null,
      radiologistNotes: data.radiologistNotes || null,
      conclusion: data.conclusion || null,
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

  // Process DICOM file if provided
  if (data.dicomFile) {
    try {
      // Parse DICOM metadata
      const metadata = parseDicomMetadata(data.dicomFile.buffer);

      // Upload to Supabase
      const uniqueName = `scans/exam_${exam.id}_${Date.now()}.dcm`;
      const { error: uploadError } = await supabase.storage
        .from('dicoms')
        .upload(uniqueName, data.dicomFile.buffer, {
          contentType: 'application/dicom'
        });

      if (uploadError) throw uploadError;

      const publicUrl = getPublicUrl('dicoms', uniqueName);

      // Update exam with DICOM data
      await prisma.exam.update({
        where: { id: exam.id },
        data: {
          dicomFileName: data.dicomFile.originalname,
          dicomSupabasePath: uniqueName,
          dicomPublicUrl: publicUrl,
          dicomUploadedAt: new Date(),
          performedAt: parseDicomDate(metadata.studyDate) || exam.performedAt,
          modality: metadata.modality || exam.modality,
          bodyPart: metadata.bodyPart || exam.bodyPart
        }
      });
    } catch (error) {
      // If DICOM processing fails, delete the exam and re-throw
      await prisma.exam.delete({ where: { id: exam.id } });
      throw new ValidationError('Failed to process DICOM file: ' + (error as Error).message);
    }
  }
  // ⭐ AFTER exam is successfully created (and dicom processed if exists)
try {
  // Recalculate subtotal and update invoice
  const caseId = exam.caseId;

  // Fetch all cost items of this case
  const [exams, labTests, treatments, physioPrograms] = await Promise.all([
    prisma.exam.findMany({ where: { caseId } }),
    prisma.labTest.findMany({ where: { caseId } }),
    prisma.treatment.findMany({ where: { caseId } }),
    prisma.physioProgram.findMany({ where: { caseId } }),
  ]);

  const APPOINTMENT_PRICE = 150;

  const subtotal =
    APPOINTMENT_PRICE +
    exams.reduce((s, e) => s + (e.cost || 0), 0) +
    labTests.reduce((s, l) => s + (l.cost || 0), 0) +
    treatments.reduce((s, t) => s + (t.cost || 0), 0) +
    physioPrograms.reduce((s, p) => s + ((p.costPerSession || 0) * p.numberOfSessions), 0);

  await prisma.invoice.updateMany({
    where: { caseId },
    data: {
      subtotal,
      totalAmount: subtotal,
      items: {
        exams: exams,
        labTests,
        treatments,
        physioPrograms
      }
    }
  });

} catch (err) {
  console.error("Invoice update failed after Exam creation", err);
}


  // Return the exam with updated images
  return await prisma.exam.findUnique({
    where: { id: exam.id },
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
};

/**
 * Upload DICOM to existing exam
 */
export const uploadDicomToExam = async (examId: number, dicomFile: Express.Multer.File) => {
  validatePositiveInt(examId, 'examId');

  // Check if exam exists
  const exam = await prisma.exam.findUnique({
    where: { id: examId }
  });

  if (!exam) {
    throw new NotFoundError('Exam not found');
  }

  // Check if exam already has a DICOM (reject as per requirements)
  if (exam.dicomPublicUrl) {
    throw new ValidationError('Exam already has a DICOM file. Only one DICOM per exam is allowed.');
  }

  try {
    // Parse DICOM metadata
    const metadata = parseDicomMetadata(dicomFile.buffer);

    // Upload to Supabase
    const uniqueName = `scans/exam_${examId}_${Date.now()}.dcm`;
    const { error: uploadError } = await supabase.storage
      .from('dicoms')
      .upload(uniqueName, dicomFile.buffer, {
        contentType: 'application/dicom'
      });

    if (uploadError) throw uploadError;

    const publicUrl = getPublicUrl('dicoms', uniqueName);

    // Update exam with DICOM data and status
    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        status: 'COMPLETED',
        performedAt: parseDicomDate(metadata.studyDate) || exam.performedAt,
        modality: metadata.modality || exam.modality,
        bodyPart: metadata.bodyPart || exam.bodyPart,
        dicomFileName: dicomFile.originalname,
        dicomSupabasePath: uniqueName,
        dicomPublicUrl: publicUrl,
        dicomUploadedAt: new Date()
      }
    });

    return updatedExam;
  } catch (error) {
    throw new ValidationError('Failed to process DICOM file: ' + (error as Error).message);
  }
};

/**
 * Get exam by ID
 */
export const getExamById = async (id: number) => {
  validatePositiveInt(id, 'id');

  const exam = await prisma.exam.findUnique({
    where: { id },
    select: {
      id: true,
      caseId: true,
      modality: true,
      bodyPart: true,
      status: true,
      scheduledAt: true,
      performedAt: true,
      radiologistNotes: true,
      conclusion: true,
      cost: true,
      dicomFileName: true,
      dicomPublicUrl: true,
      dicomUploadedAt: true,
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

  if (!exam) {
    throw new NotFoundError('Exam not found');
  }

  return exam;
};

/**
 * Update exam
 */
export const updateExam = async (id: number, data: Partial<CreateExamData>) => {
  validatePositiveInt(id, 'id');

  // Check exam exists and get current state
  const currentExam = await prisma.exam.findUnique({
    where: { id }
  });

  if (!currentExam) {
    throw new NotFoundError('Exam not found');
  }

  // Validate modality if provided
  if (data.modality) {
    const validModalities = ['MRI', 'CT', 'X-RAY', 'Ultrasound', 'PET', 'DEXA'];
    validateEnum(data.modality, validModalities, 'modality');
  }

  // Validate status change: COMPLETED exams must have DICOMs
  if (data.status === 'COMPLETED' && !currentExam.dicomPublicUrl) {
    throw new ValidationError('Cannot mark exam as COMPLETED: exam must have a DICOM file');
  }

  const updatedExam = await prisma.exam.update({
    where: { id },
    data: {
      ...(data.modality && { modality: data.modality }),
      ...(data.bodyPart && { bodyPart: data.bodyPart }),
      ...(data.status && { status: data.status }),
      ...(data.scheduledAt !== undefined && { scheduledAt: data.scheduledAt }),
      ...(data.performedAt !== undefined && { performedAt: data.performedAt }),
      ...(data.radiologistNotes !== undefined && { radiologistNotes: data.radiologistNotes }),
      ...(data.conclusion !== undefined && { conclusion: data.conclusion }),
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

  return updatedExam;
};
