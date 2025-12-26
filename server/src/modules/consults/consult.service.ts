import { prisma } from '../../config/db.js';
import { NotFoundError, ValidationError, AuthorizationError } from '../../utils/AppError.js';
import { 
  validateEmail, 
  validatePermissions, 
  validateExpiryHours, 
  validateAthleteId,
  validateToken 
} from './consult.validation.js';

/**
 * Interface for the permissions JSON
 */
interface SharePermissions {
  caseIds?: number[];
  examIds?: number[];
  labIds?: number[];
  notes?: string;
}

/**
 * 1. Create a Share Link (Clinician Only)
 */
export const createShareLink = async (
  clinicianId: number,
  athleteId: number,
  permissions: SharePermissions,
  expiryHours: number = 48
) => {
  // Input validation
  validateAthleteId(athleteId);
  validatePermissions(permissions);
  validateExpiryHours(expiryHours);

  // Validate Athlete exists and has correct role
  const athlete = await prisma.user.findUnique({
    where: { id: athleteId }
  });

  if (!athlete) {
    throw new NotFoundError("Athlete not found");
  }

  if (athlete.role !== 'ATHLETE') {
    throw new ValidationError("The specified user is not an athlete");
  }

  // Verify clinician owns or has access to the data being shared
  await verifyClinicianAccess(clinicianId, athleteId, permissions);

  // Generate a random 6-digit access code
  const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Calculate Expiry
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiryHours);

  // Create the Record
  const share = await prisma.consultationShare.create({
    data: {
      clinicianId,
      athleteId,
      accessCode,
      permissions: permissions as any, // Cast to JSON
      expiresAt
    }
  });

  return share;
};

/**
 * 2. Access Shared Data (Public/External)
 * Validates token and access code, then fetches the specific allowed data.
 */
export const getSharedData = async (token: string, accessCode: string) => {
  // Validate token format
  validateToken(token);

  // Find the Share Record
  const share = await prisma.consultationShare.findUnique({
    where: { token },
    include: {
      clinician: { select: { fullName: true, email: true } }, // Show who shared it
      athlete: { select: { fullName: true, dateOfBirth: true } } // Show patient basics
    }
  });

  if (!share) {
    throw new NotFoundError("Invalid consultation link");
  }

  // Validate access code
  if (share.accessCode !== accessCode) {
    throw new AuthorizationError("Invalid access code");
  }

  // Check Expiry
  if (new Date() > share.expiresAt) {
    throw new AuthorizationError("This consultation link has expired");
  }

  // Update Access Log
  await prisma.consultationShare.update({
    where: { id: share.id },
    data: { accessedAt: new Date() }
  });

  // Parse Permissions
  const perms = share.permissions as SharePermissions;
  
  // Dynamic Fetching: Only fetch what is in the Allow List
  const cases = perms.caseIds?.length 
    ? await prisma.case.findMany({
        where: { id: { in: perms.caseIds } },
        include: { treatments: true, physioPrograms: true } // Include safe details
      }) 
    : [];

  const exams = perms.examIds?.length
    ? await prisma.exam.findMany({
        where: { id: { in: perms.examIds } },
        include: { images: true } // Crucial for viewing scans
      })
    : [];

  const labs = perms.labIds?.length
    ? await prisma.labTest.findMany({
        where: { id: { in: perms.labIds } }
      })
    : [];

  return {
    meta: {
      sharedBy: share.clinician.fullName,
      patientName: share.athlete.fullName,
      expiresAt: share.expiresAt,
      notes: perms.notes
    },
    data: {
      cases,
      exams,
      labs
    }
  };
};

/**
 * Verify that the clinician has access to the data they're trying to share
 */
async function verifyClinicianAccess(
  clinicianId: number,
  athleteId: number,
  permissions: SharePermissions
): Promise<void> {
  // Check cases
  if (permissions.caseIds?.length) {
    const cases = await prisma.case.findMany({
      where: {
        id: { in: permissions.caseIds },
        athleteId: athleteId
      },
      select: { id: true }
    });

    if (cases.length !== permissions.caseIds.length) {
      throw new AuthorizationError("Some case IDs are invalid or don't belong to this athlete");
    }
  }

  // Check exams
  if (permissions.examIds?.length) {
    const exams = await prisma.exam.findMany({
      where: {
        id: { in: permissions.examIds },
        medicalCase: { athleteId: athleteId }
      },
      select: { id: true }
    });

    if (exams.length !== permissions.examIds.length) {
      throw new AuthorizationError("Some exam IDs are invalid or don't belong to this athlete");
    }
  }

  // Check lab tests
  if (permissions.labIds?.length) {
    const labs = await prisma.labTest.findMany({
      where: {
        id: { in: permissions.labIds },
        medicalCase: { athleteId: athleteId }
      },
      select: { id: true }
    });

    if (labs.length !== permissions.labIds.length) {
      throw new AuthorizationError("Some lab test IDs are invalid or don't belong to this athlete");
    }
  }
}