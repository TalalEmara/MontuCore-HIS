import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { bookAppointmentApi } from './useAppointments'; 
import { createCaseApi } from './useCaseRecord'; 

// --- 1. Interfaces ---

export interface RegisterResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: number;
    email: string;
    fullName: string;
    role: string;
  };
}

export interface BaseRegisterData {
  email: string;
  password: string;
  fullName: string;
  gender: 'Male' | 'Female';
  dob: string;
}

export interface ClinicianRegisterInput extends BaseRegisterData {
  specialty: string;
}

export interface AthleteRegisterInput extends BaseRegisterData {
  position: string;
  jerseyNumber: number;
  height: number;
  weight: number;
  status: 'fit' | 'injured';
  diagnosis?: string;
  labTests?: Array<{ testName: string; category: string; file: File }>;
  exams?: Array<{ modality: string; bodyPart: string; file: File; dicomFiles?: File[] }>;
}

// --- 2. Helper Functions (Local) ---

const registerUserApi = async (data: any, token: string, API_URL: string) => {
  console.log("➡️ [API] Registering User...", data.generalData.email);
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ [API] Registration Failed:", errorData);
      throw new Error(errorData.message || 'Failed to register user');
    }
    
    const result = await response.json();
    console.log("✅ [API] User Registered ID:", result?.id);
    return result;

  } catch (error) {
    console.error("❌ [API] Network/Server Error during registration:", error);
    throw error;
  }
};

const uploadLabTests = async (caseId: number, labs: AthleteRegisterInput['labTests'], token: string, API_URL: string) => {
  if (!labs || labs.length === 0) {
    console.log("ℹ️ [Files] No lab tests to upload.");
    return;
  }

  console.log(`➡️ [Files] Uploading ${labs.length} lab tests for Case ID: ${caseId}`);

  const uploadPromises = labs.map((lab) => {
    const formData = new FormData();
    formData.append('caseId', String(caseId));
    formData.append('testName', lab.testName);
    formData.append('category', lab.category);
    formData.append('status', 'COMPLETED');
    formData.append('sampleDate', new Date().toISOString());
    formData.append('cost', '0');
    if (lab.file) formData.append('pdf', lab.file);

    return fetch(`${API_URL}/lab-tests`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    .then(async res => {
        if(!res.ok) throw new Error(await res.text());
        console.log(`✅ [Files] Lab '${lab.testName}' uploaded.`);
    })
    .catch((e) => console.error(`❌ [Files] Failed to upload lab: ${lab.testName}`, e));
  });

  await Promise.all(uploadPromises);
};

const uploadExams = async (caseId: number, exams: AthleteRegisterInput['exams'], token: string, API_URL: string) => {
  if (!exams || exams.length === 0) {
    console.log("ℹ️ [Files] No exams to upload.");
    return;
  }

  console.log(`➡️ [Files] Uploading ${exams.length} exams for Case ID: ${caseId}`);

  const uploadPromises = exams.map((exam) => {
    const formData = new FormData();
    formData.append('caseId', String(caseId));
    formData.append('modality', exam.modality);
    formData.append('bodyPart', exam.bodyPart);
    formData.append('status', 'COMPLETED');
    formData.append('scheduledAt', new Date().toISOString());
    formData.append('performedAt', new Date().toISOString());
    formData.append('cost', '0');

    // ✅ CHECK 1: Use the correct field name 'dicomFiles' (plural)
    if (exam.dicomFiles && exam.dicomFiles.length > 0) {
        exam.dicomFiles.forEach((file) => {
            formData.append('dicomFiles', file); 
        });
        console.log(`📎 [Files] Attached ${exam.dicomFiles.length} DICOM files for ${exam.modality}`);
    } 
    
    // Fallback for generic file
    if (exam.file && (!exam.dicomFiles || exam.dicomFiles.length === 0)) {
         formData.append('file', exam.file); 
    }

    // ✅ CHECK 2: Use the specific endpoint for multiple uploads
    // Changing from /exams to /exams/multiple-dicom based on your feedback
    return fetch(`${API_URL}/exams/with-multiple-dicoms`, { 
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    .then(async res => {
        if(!res.ok) {
            const errText = await res.text();
            throw new Error(`Server responded with ${res.status}: ${errText}`);
        }
        console.log(`✅ [Files] Exam '${exam.modality}' uploaded successfully.`);
    })
    .catch((e) => console.error(`❌ [Files] Failed to upload exam: ${exam.modality}`, e));
  });

  await Promise.all(uploadPromises);
};
// --- 3. Main Logic ---

const registerAthleteChainApi = async (
  data: AthleteRegisterInput,
  adminId: number,
  token: string,
  API_URL: string = `http://localhost:3000/api`
) => {
  console.group("🚀 START: Athlete Registration Chain");
  console.log("📦 Input Data:", data);

  try {
    // 1. Register User
    const registerPayload = {
      generalData: {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: 'ATHLETE',
        gender: data.gender,
        dob: data.dob,
      },
      userData: { position: data.position, jerseyNumber: data.jerseyNumber },
    };

    const regResult = await registerUserApi(registerPayload, token, API_URL);
    const newAthleteId = regResult?.id;

    if (!newAthleteId) {
        console.error("❌ STOP: User ID missing from registration response.");
        console.groupEnd();
        return regResult;
    }

    // 2. Create Appointment
    console.log("➡️ [Chain] Attempting to create appointment...");
    
    // Safety check for imported function
    if (!bookAppointmentApi) {
        throw new Error("Critical: bookAppointmentApi is undefined. Check imports.");
    }

    let apptResult;
    try {
        apptResult = await bookAppointmentApi({
            athleteId: newAthleteId,
            clinicianId: adminId,
            scheduledAt: new Date(Date.now() + 60 * 1000).toISOString(),
            height: data.height,
            weight: data.weight,
            status: 'COMPLETED',
            diagnosisNotes: 'Initial Registration Intake'
        }, token);
    } catch (err) {
        console.error("❌ [Chain] Appointment API threw an error:", err);
        // We catch here to allow the function to return the user registration success
        // But we explicitly log it so you see it.
        console.groupEnd();
        return regResult; 
    }

    if (!apptResult || !apptResult.success) {
      console.warn("⚠️ [Chain] Appointment API returned failure or null.", apptResult);
      console.groupEnd();
      return regResult;
    }

    console.log("✅ [Chain] Appointment created. ID:", apptResult.data.id);
    const newAppointmentId = apptResult.data.id;

    // 3. Determine Case Logic
    const hasFiles = (data.labTests && data.labTests.length > 0) || (data.exams && data.exams.length > 0);
    
    console.log(`ℹ️ [Logic] Status: '${data.status}', Has Files: ${hasFiles}`);

    let caseStatus = null;
    if (data.status === 'injured') {
      caseStatus = 'ACTIVE';
    } else if (data.status === 'fit' && hasFiles) {
      caseStatus = 'RECOVERED';
    }

    console.log(`ℹ️ [Logic] Calculated Case Status: ${caseStatus || 'NONE'}`);

    // 4. Create Case & Upload Files
    if (caseStatus) {
      const diagnosisName = data.diagnosis || (caseStatus === 'RECOVERED' ? 'Historical Medical Record' : 'Initial Injury Assessment');
      
      console.log("➡️ [Chain] creating Case...");
      
      try {
        const caseResult = await createCaseApi({
            athleteId: newAthleteId,
            managingClinicianId: adminId,
            initialAppointmentId: newAppointmentId,
            diagnosisName,
            icd10Code: 'N/A',
            injuryDate: new Date().toISOString(),
            status: caseStatus,
            severity: 'MILD',
            medicalGrade: 'Pending'
        }, token, API_URL);

        if (caseResult && caseResult.data?.id) {
            const newCaseId = caseResult.data.id;
            console.log("✅ [Chain] Case created. ID:", newCaseId);
            
            // Parallelize file uploads
            console.log("➡️ [Chain] Starting file uploads...");
            await Promise.all([
            uploadLabTests(newCaseId, data.labTests, token, API_URL),
            uploadExams(newCaseId, data.exams, token, API_URL)
            ]);
            console.log("✅ [Chain] File uploads completed.");
        } else {
            console.error("❌ [Chain] Case creation returned invalid data:", caseResult);
        }
      } catch (err) {
         console.error("❌ [Chain] Case Creation/Upload Failed:", err);
      }
    } else {
        console.log("ℹ️ [Chain] Skipping case creation (Fit & No Files)");
    }

    console.log("🏁 FINISH: Registration Chain Complete");
    console.groupEnd();
    return regResult;

  } catch (error) {
    console.error("❌ CRITICAL ERROR in Registration Chain:", error);
    console.groupEnd();
    throw error;
  }
};

// --- 4. Hooks ---

export const useClinicianReg = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: (data: ClinicianRegisterInput) => {
        if (!token) throw new Error("Authentication required");
        const payload = {
            generalData: { ...data, role: 'CLINICIAN' },
            userData: { specialty: data.specialty }
        };
        return registerUserApi(payload, token, `http://localhost:3000/api`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['clinicians'] });
    },
  });
};

export const useAthleteReg = (adminId: number) => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: (data: AthleteRegisterInput) => {
        if (!token) throw new Error("Authentication required");
        return registerAthleteChainApi(data, adminId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    onError: (error) => {
        console.error("🚨 Mutation Error Callback:", error);
    }
  });
};