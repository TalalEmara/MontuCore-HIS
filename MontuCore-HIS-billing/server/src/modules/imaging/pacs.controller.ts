import type { Request, Response } from 'express';
import { prisma } from '../../index.js';
import { supabase, getPublicUrl } from '../../storage/supabase.service.js';
import dicomParser from 'dicom-parser';

// Extend Request type to include Multer file
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

const parseDicomDate = (dateString: string | undefined): Date => {
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
        // req.file exists here (added by Multer)
        const file = req.file; // Type: Express.Multer.File
        const { caseId } = req.body; // Passed from frontend

        // 1. Parse DICOM Metadata (The "Magic" Step)
        const metadata = parseDicomMetadata(file.buffer);
        console.log('🩻 Extracted Metadata:', metadata);

        // 2. Upload to Supabase
        const uniqueName = `scans/${Date.now()}_${file.originalname}`;
        const { error: uploadError } = await supabase.storage
            .from('dicoms')
            .upload(uniqueName, file.buffer, {
                contentType: 'application/dicom'
            });

        if (uploadError) throw uploadError;

        const publicUrl = getPublicUrl('dicoms', uniqueName);

        // 3. Create or Find the Exam Record
        // We auto-create an Exam based on the file's metadata
        const exam = await prisma.exam.create({
            data: {
                caseId: parseInt(caseId),
                modality: metadata.modality || 'UNKNOWN',
                bodyPart: metadata.bodyPart || 'UNKNOWN',
                status: 'IMAGING_COMPLETE',
                scheduledAt: new Date(), // It's done now
                performedAt: parseDicomDate(metadata.studyDate),
            }
        });

        // 4. Link the Image
        const image = await prisma.pACSImage.create({
            data: {
                examId: exam.id,
                fileName: file.originalname,
                supabasePath: uniqueName,
                publicUrl: publicUrl
            }
        });

        res.status(201).json({ 
            message: 'Scan processed and saved', 
            exam, 
            image,
            metadata 
        });

    } catch (error: any) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Failed to process DICOM file' });
    }
};