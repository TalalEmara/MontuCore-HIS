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
const parseDicomDate = (dateString: string | null | undefined): Date => {
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
        caseId: true,
        modality: true,
        bodyPart: true,
        status: true,
        scheduledAt: true,
        performedAt: true,
        radiologistNotes: true,
        conclusion: true,
        cost: true,
        pacsImages: {
          select: {
            id: true,
            fileName: true,
            publicUrl: true,
            uploadedAt: true
          }
        },
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

export const getUpcomingExamsByAthleteId = async (athleteId: number) => {
  const now = new Date();
  return getExams({ athleteId, dateRange: { startDate: now, endDate: new Date('2100-01-01') } });
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
      const timestamp = Date.now();
      const uniqueName = `scans/case_${data.caseId}/exam_${timestamp}/${data.dicomFile.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from('dicoms')
        .upload(uniqueName, data.dicomFile.buffer, {
          contentType: 'application/dicom'
        });

      if (uploadError) throw uploadError;

      const publicUrl = getPublicUrl('dicoms', uniqueName);

      // Create PACS image record
      await prisma.pACSImage.create({
        data: {
          examId: exam.id,
          fileName: data.dicomFile.originalname,
          supabasePath: uniqueName,
          publicUrl: publicUrl
        }
      });

      // Update exam with metadata from DICOM
      await prisma.exam.update({
        where: { id: exam.id },
        data: {
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

  // Return the exam with updated images
  return await prisma.exam.findUnique({
    where: { id: exam.id },
    include: {
      pacsImages: {
        select: {
          id: true,
          fileName: true,
          publicUrl: true,
          uploadedAt: true
        }
      },
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

  try {
    // Parse DICOM metadata
    const metadata = parseDicomMetadata(dicomFile.buffer);

    // Upload to Supabase
    const timestamp = Date.now();
    const uniqueName = `scans/case_${exam.caseId}/exam_${timestamp}/${dicomFile.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from('dicoms')
      .upload(uniqueName, dicomFile.buffer, {
        contentType: 'application/dicom'
      });

    if (uploadError) throw uploadError;

    const publicUrl = getPublicUrl('dicoms', uniqueName);

    // Create PACS image record
    await prisma.pACSImage.create({
      data: {
        examId: examId,
        fileName: dicomFile.originalname,
        supabasePath: uniqueName,
        publicUrl: publicUrl
      }
    });

    // Update exam with metadata and status
    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        status: 'COMPLETED',
        performedAt: parseDicomDate(metadata.studyDate) || exam.performedAt,
        modality: metadata.modality || exam.modality,
        bodyPart: metadata.bodyPart || exam.bodyPart
      },
      include: {
        pacsImages: {
          select: {
            id: true,
            fileName: true,
            publicUrl: true,
            uploadedAt: true
          }
        },
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

    return updatedExam;
  } catch (error) {
    throw new ValidationError('Failed to process DICOM file: ' + (error as Error).message);
  }
};

/**
 * Mark exam as completed
 */
export const markExamCompleted = async (examId: number) => {
  validatePositiveInt(examId, 'examId');

  // Check if exam exists
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      pacsImages: {
        select: {
          id: true,
          fileName: true,
          publicUrl: true,
          uploadedAt: true
        }
      },
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

  if (!exam) {
    throw new NotFoundError('Exam not found');
  }

  if (exam.status === 'COMPLETED') {
    throw new ValidationError('Exam is already completed');
  }

  // Update exam status to COMPLETED
  const updatedExam = await prisma.exam.update({
    where: { id: examId },
    data: {
      status: 'COMPLETED',
      performedAt: exam.performedAt || new Date() // Set performedAt if not already set
    },
    include: {
      pacsImages: {
        select: {
          id: true,
          fileName: true,
          publicUrl: true,
          uploadedAt: true
        }
      },
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

  return updatedExam;
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
      pacsImages: {
        select: {
          id: true,
          fileName: true,
          publicUrl: true,
          uploadedAt: true
        }
      },
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

/**
 * Create exam with multiple DICOM files
 */
export const createExamWithMultipleDicoms = async (data: {
  caseId?: number;
  examId?: number;
  modality?: string;
  bodyPart?: string;
  status?: string;
  scheduledAt?: Date;
  performedAt?: Date;
  radiologistNotes?: string;
  conclusion?: string;
  cost?: number;
  dicomFiles?: Express.Multer.File[];
}) => {
  // Validate required fields - either caseId or examId must be provided
  if (!data.caseId && !data.examId) {
    throw new ValidationError('Either caseId (for new exam) or examId (for existing exam) must be provided');
  }
  if (data.caseId && data.examId) {
    throw new ValidationError('Cannot provide both caseId and examId');
  }

  let exam;

  if (data.caseId) {
    // Create new exam
    // Determine final status
    let finalStatus = data.status || 'ORDERED';
    if (data.dicomFiles && data.dicomFiles.length > 0) {
      finalStatus = 'COMPLETED'; // DICOM uploads auto-complete
    }

    // Create the exam
    exam = await prisma.exam.create({
      data: {
        caseId: data.caseId,
        modality: data.modality || 'UNKNOWN',
        bodyPart: data.bodyPart || 'UNKNOWN',
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
  } else {
    // Use existing exam
    validatePositiveInt(data.examId!, 'examId');

    const existingExam = await prisma.exam.findUnique({
      where: { id: data.examId },
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

    if (!existingExam) {
      throw new NotFoundError('Exam not found');
    }

    exam = existingExam;

    // Update exam status to COMPLETED if DICOMs are being added
    if (data.dicomFiles && data.dicomFiles.length > 0) {
      await prisma.exam.update({
        where: { id: data.examId },
        data: { status: 'COMPLETED' }
      });
      exam.status = 'COMPLETED';
    }
  }

  // Process DICOM files if provided
  if (data.dicomFiles && data.dicomFiles.length > 0) {
    // Use metadata from the first file for the exam
    const firstFile = data.dicomFiles[0];
    let examMetadata = { modality: 'MRI', bodyPart: 'UNKNOWN', studyDate: null };

    try {
      examMetadata = parseDicomMetadata(firstFile.buffer);
    } catch (error) {
      console.warn('Failed to parse DICOM metadata from first file, using defaults:', error);
    }

    // Update exam with metadata from first DICOM (only if not already set)
    const updateData: any = {};
    if (!exam.performedAt && parseDicomDate(examMetadata.studyDate)) {
      updateData.performedAt = parseDicomDate(examMetadata.studyDate);
    }
    if ((!exam.modality || exam.modality === 'UNKNOWN') && examMetadata.modality) {
      updateData.modality = examMetadata.modality;
    }
    if ((!exam.bodyPart || exam.bodyPart === 'UNKNOWN') && examMetadata.bodyPart) {
      updateData.bodyPart = examMetadata.bodyPart;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.exam.update({
        where: { id: exam.id },
        data: updateData
      });
      // Update the exam object with new data
      Object.assign(exam, updateData);
    }

    // Process all DICOM files
    const timestamp = Date.now();
    const caseId = exam.caseId; // Use caseId from exam (works for both new and existing)
    const pacsImagesData = [];

    for (const file of data.dicomFiles) {
      try {
        const uniqueName = `scans/case_${caseId}/exam_${exam.id}_${timestamp}/${file.originalname}`;
        const { error: uploadError } = await supabase.storage
          .from('dicoms')
          .upload(uniqueName, file.buffer, {
            contentType: 'application/dicom'
          });

        if (uploadError) throw uploadError;

        const publicUrl = getPublicUrl('dicoms', uniqueName);

        pacsImagesData.push({
          examId: exam.id,
          fileName: file.originalname,
          supabasePath: uniqueName,
          publicUrl: publicUrl
        });
      } catch (error) {
        console.error(`Failed to process DICOM file ${file.originalname}:`, error);
        // Continue with other files
      }
    }

    // Batch insert PACS images
    if (pacsImagesData.length > 0) {
      await prisma.pACSImage.createMany({
        data: pacsImagesData
      });
    }
  }

  // Return the exam with updated images
  return await prisma.exam.findUnique({
    where: { id: exam.id },
    include: {
      pacsImages: {
        select: {
          id: true,
          fileName: true,
          publicUrl: true,
          uploadedAt: true
        }
      },
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
