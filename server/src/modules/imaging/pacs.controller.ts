import type { Request, Response } from 'express';
import { prisma } from '../../index.js';
import { supabase, getPublicUrl } from '../../storage/supabase.service.js';
import dicomParser from 'dicom-parser';

// Extend Request type to include Multer file
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

const parseDicomDate = (dateString: string | null | undefined): Date => {
  if (!dateString || dateString.length !== 8) {
    return new Date(); // Fallback to "now" if missing or invalid
  }

  // Convert '19941013' -> '1994-10-13'
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);

  return new Date(`${year}-${month}-${day}`);
};

// Helper to parse DICOM buffer
const parseDicomMetadata = (buffer: Buffer) => {
    // Convert Node Buffer to Uint8Array for dicom-parser
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

export const uploadAndProcessScan = async (
    req: Request, 
    res: Response
): Promise<Response | undefined> => {
    // Check if file exists
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const file = req.file;
        const { caseId, examId } = req.body;

        // Validate that either caseId or examId is provided
        if (!caseId && !examId) {
            return res.status(400).json({ error: 'Either caseId or examId must be provided' });
        }

        // 1. Parse DICOM Metadata
        const metadata = parseDicomMetadata(file.buffer);
        console.log('🩻 Extracted Metadata:', metadata);

        // 2. Upload to Supabase
        const timestamp = Date.now();
        const uniqueName = `scans/case_${caseId || examId}/exam_${timestamp}/${file.originalname}`;
        const { error: uploadError } = await supabase.storage
            .from('dicoms')
            .upload(uniqueName, file.buffer, {
                contentType: 'application/dicom'
            });

        if (uploadError) throw uploadError;

        const publicUrl = getPublicUrl('dicoms', uniqueName);

        let exam;

        if (examId) {
            // Attach to existing exam
            const existingExam = await prisma.exam.findUnique({
                where: { id: parseInt(examId) }
            });

            if (!existingExam) {
                return res.status(404).json({ error: 'Exam not found' });
            }

            // Update exam with DICOM metadata and set status to COMPLETED
            exam = await prisma.exam.update({
                where: { id: parseInt(examId) },
                data: {
                    status: 'COMPLETED',
                    performedAt: parseDicomDate(metadata.studyDate) || existingExam.performedAt,
                    modality: metadata.modality || existingExam.modality,
                    bodyPart: metadata.bodyPart || existingExam.bodyPart
                }
            });

            // Create PACS image record
            await prisma.pACSImage.create({
                data: {
                    examId: exam.id,
                    fileName: file.originalname,
                    supabasePath: uniqueName,
                    publicUrl: publicUrl
                }
            });
        } else {
            // Create new exam
            exam = await prisma.exam.create({
                data: {
                    caseId: parseInt(caseId),
                    modality: metadata.modality || 'UNKNOWN',
                    bodyPart: metadata.bodyPart || 'UNKNOWN',
                    status: 'COMPLETED', // DICOM upload auto-completes
                    performedAt: parseDicomDate(metadata.studyDate)
                }
            });

            // Create PACS image record
            await prisma.pACSImage.create({
                data: {
                    examId: exam.id,
                    fileName: file.originalname,
                    supabasePath: uniqueName,
                    publicUrl: publicUrl
                }
            });
        }

        res.status(201).json({ 
            message: 'Scan processed and saved', 
            exam,
            metadata 
        });

    } catch (error: any) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Failed to process DICOM file' });
    }
};

export const linkScanSeries = async (
    req: Request,
    res: Response
): Promise<Response | undefined> => {
    try {
        const { caseId, images } = req.body;

        // Validate required fields
        if (!caseId || !images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ error: 'caseId and images array are required' });
        }

        // Validate case exists
        const caseExists = await prisma.case.findUnique({
            where: { id: parseInt(caseId) }
        });

        if (!caseExists) {
            return res.status(404).json({ error: 'Case not found' });
        }

        // Validate supabasePath format for each image
        const expectedPathRegex = /^scans\/case_\d+\/exam_\d+\/.+$/;
        for (const image of images) {
            if (!image.fileName || !image.supabasePath) {
                return res.status(400).json({ error: 'Each image must have fileName and supabasePath' });
            }
            if (!expectedPathRegex.test(image.supabasePath)) {
                return res.status(400).json({
                    error: 'Invalid supabasePath format. Expected: scans/case_{caseId}/exam_{timestamp}/{filename}'
                });
            }
        }

        // Extract metadata from the first DICOM file
        let metadata;
        try {
            const firstImage = images[0];
            const { data, error } = await supabase.storage
                .from('dicoms')
                .download(firstImage.supabasePath);

            if (error) throw error;

            // Convert blob to buffer for dicom-parser
            const arrayBuffer = await data.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            metadata = parseDicomMetadata(buffer);

            console.log('🩻 Extracted metadata from first DICOM:', metadata);
        } catch (error) {
            console.warn('Failed to parse DICOM metadata, using defaults:', error);
            metadata = {
                modality: 'MRI',
                bodyPart: 'UNKNOWN',
                studyDate: null
            };
        }

        // Create new exam with extracted metadata
        const exam = await prisma.exam.create({
            data: {
                caseId: parseInt(caseId),
                modality: metadata.modality || 'MRI',
                bodyPart: metadata.bodyPart || 'UNKNOWN',
                status: 'COMPLETED',
                performedAt: parseDicomDate(metadata.studyDate)
            }
        });

        // Prepare PACS images data
        const pacsImagesData = images.map(image => ({
            examId: exam.id,
            fileName: image.fileName,
            supabasePath: image.supabasePath,
            publicUrl: getPublicUrl('dicoms', image.supabasePath)
        }));

        // Batch insert PACS images
        await prisma.pACSImage.createMany({
            data: pacsImagesData
        });

        // Fetch the created images to return in response
        const createdImages = await prisma.pACSImage.findMany({
            where: { examId: exam.id }
        });

        res.status(201).json({
            message: 'Scan series linked successfully',
            exam,
            images: createdImages,
            metadata
        });

    } catch (error: any) {
        console.error('Link Series Error:', error);
        res.status(500).json({ error: 'Failed to link scan series' });
    }
};