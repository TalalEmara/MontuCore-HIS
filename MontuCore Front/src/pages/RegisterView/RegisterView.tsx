import { useState } from "react";
import { z } from "zod";
import TextInput from "../../components/level-0/TextInput/TextInput";
import Button from "../../components/level-0/Button/Bottom";
import ComboBox from "../../components/level-0/ComboBox/ComboBox";
import RadioButton from "../../components/level-0/RadioButton/RadioButton";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import styles from "./RegisterView.module.css";
import { useAthleteReg, useClinicianReg } from "../../hooks/useRegister";

const generalSchema = z.object({
  fullName: z.string({ message: "This field is required" })
    .min(1, "This field is required")
    .min(3, "Full name must be at least 3 characters"),
  email: z.string({ message: "This field is required" })
    .min(1, "This field is required")
    .email("Invalid email address"),
  password: z.string({ message: "This field is required" })
    .min(1, "This field is required")
    .min(8, "Password must be at least 8 characters"),
  gender: z.enum(["male", "female"], { 
    message: "This field is required" }),    
  role: z.enum(["athlete", "physician", "physiotherapy"], { 
    message: "This field is required" }),
});

const athleteBasicSchema = z.object({
  height: z.number({ message: "This field is required" })
    .min(140, "Height must be realistic")
    .max(200),
  weight: z.number({ message: "This field is required" })
    .min(45, "Weight must be realistic")
    .max(110),
  birthDate: z.string().min(1, "Birth date is required")
    .refine((date) => {
      const year = new Date(date).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - year;
      return age >= 10 && age <= 60;
    }, "Athlete must be between 10 and 60 years old"),
});

const athleteDetailsSchema = z.object({
  status: z.enum(["fit", "injured"],{ 
    message: "This field is required" }),
  diagnosis: z.string().optional(),
  jerseyNumber: z.number({ message: "This field is required" })
    .min(1)
    .max(99),
    position: z.string().min(2, "Position is required"),
}).refine((data) => {
  if (data.status === "injured") {
    return !!data.diagnosis && data.diagnosis.length >= 2;
  }
  return true;
}, { 
  message: "Diagnosis name is required for injured athletes", 
  path: ["diagnosis"] 
});

const athleteMedicalDataSchema = z.object({
  notes: z.string()
    .min(1, "Notes are required")
    .max(500, "Notes cannot exceed 500 characters"),

  labTests: z
    .array(
      z.object({
        testName: z.string().min(1, "Test name is required"),
        category: z.string().min(1, "Category is required"),
        file: z.instanceof(File).refine(file => file instanceof File, {
          message: "File is required",
        }),
      })
    )
    .optional(),

  exams: z
    .array(
      z.object({
        modality: z.string().min(1, "Modality is required"),
        bodyPart: z.string().min(1, "Body Part is required"),
        dicomFiles: z.array(z.instanceof(File)).optional()
      })
    )
    .optional()
});




const staffSchema = z.object({
  birthDate: z.string().min(1, "Birth date is required"),
  position: z.string().min(2, "Position is required"),
});

const today = new Date().toISOString().split("T")[0];

type GeneralFormData = z.infer<typeof generalSchema>;
type AthleteBasicFormData = z.infer<typeof athleteBasicSchema>;
type AthleteDetailsFormData = z.infer<typeof athleteDetailsSchema>;
type StaffFormData = z.infer<typeof staffSchema>;

function RegisterView() {
  const [step, setStep] = useState(1);
  const [generalData, setGeneralData] = useState<Partial<GeneralFormData>>({});
  const [athleteBasicData, setAthleteBasicData] = useState<Partial<AthleteBasicFormData>>({});
  const [athleteDetailsData, setAthleteDetailsData] = useState<Partial<AthleteDetailsFormData>>({});
  const [staffData, setStaffData] = useState<Partial<StaffFormData>>({});

  const [labTests, setLabTests] = useState<Array<{testName: string, category: string, file: File}>>([]);
  const [exams, setExams] = useState<Array<{modality: string, bodyPart: string, file: File}>>([]);

  const [showLabModal, setShowLabModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);

  const [currentLabTest, setCurrentLabTest] = useState({testName: "", category: "", file: null as File | null});
  const [currentExam, setCurrentExam] = useState({modality: "", bodyPart: "", dicomFiles: [] as File[]});
      
  const [notes, setNotes] = useState("");

  
  
  const adminId =1; // Or get this from your user context
  
  const { mutate: registerClinician, isPending: isClinicianPending } = useClinicianReg();
const { mutate: registerAthlete, isPending: isAthletePending } = useAthleteReg(adminId);
  const isSubmitting = isClinicianPending || isAthletePending;
  const [errors, setErrors] = useState<Record<string, string>>({});




  const handleFinalSubmit = () => {
    const genderFormatted = generalData.gender?.toLowerCase() === 'male' ? 'Male' : 'Female';
    
    // Assuming date input gives YYYY-MM-DD, we append time to make it ISO-like
    const dobFormatted = new Date(generalData.role === 'athlete' ? athleteBasicData.birthDate! : staffData.birthDate!).toISOString();

    // 3. Define Success/Error Callbacks
    const options = {
      onSuccess: () => {
        alert("User registered successfully!");
        // Optional: redirect
        
      },
      onError: (error: Error) => {
        alert(`Registration Failed: ${error.message}`);
      }
    };

    if (generalData.role === 'athlete') {
      registerAthlete({
        email: generalData.email!,
        password: generalData.password!,
        fullName: generalData.fullName!,
        gender: genderFormatted,
        dob: dobFormatted,
        position: athleteDetailsData.position!,
        jerseyNumber: athleteDetailsData.jerseyNumber!,
        height: athleteBasicData.height || 0,
        weight: athleteBasicData.weight || 0,
        status: athleteDetailsData.status!,
        // Include diagnosis only if uploaded
        labTests: labTests, 
        exams: exams
      }, options);
      
    } else {
      // For Physician or Physio
      registerClinician({
        email: generalData.email!,
        password: generalData.password!,
        fullName: generalData.fullName!,
        gender: genderFormatted,
        dob: dobFormatted,
        specialty: `{${generalData.role}-${staffData.position}}` 
      }, options);
    }
  };

  const handleGeneralSubmit = () => {
    try {
      generalSchema.parse(generalData);
      setErrors({});
      setStep(2);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap: Record<string, string> = {};
        error.issues.forEach((err) => { if (err.path[0]) errorMap[err.path[0].toString()] = err.message; });
        setErrors(errorMap);
      }
    }
  };

  const handleAthleteBasicSubmit = () => {
    try {
      athleteBasicSchema.parse(athleteBasicData);
      setErrors({});
      setStep(3);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap: Record<string, string> = {};
        error.issues.forEach((err) => { if (err.path[0]) errorMap[err.path[0].toString()] = err.message; });
        setErrors(errorMap);
      }
    }
  };

  const handleAthleteDetailsSubmit = () => {
    try {
      athleteDetailsSchema.parse(athleteDetailsData);
      setErrors({});
      setStep(4);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap: Record<string, string> = {};
        error.issues.forEach((err) => { if (err.path[0]) errorMap[err.path[0].toString()] = err.message; });
        setErrors(errorMap);
      }
    }
  };

const handleAthleteMedicalSubmit = () => {
  try {
    athleteMedicalDataSchema.parse({ notes, labTests, exams });
    setErrors({});
    handleFinalSubmit();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMap: Record<string, string> = {};

      error.issues.forEach((err) => {
        if (err.path.length === 0) {
          if (err.message.includes("lab test")) errorMap["labTests"] = err.message;
          if (err.message.includes("exam")) errorMap["exams"] = err.message;
        } else {
          errorMap[err.path[0].toString()] = err.message;
        }
      });
      setErrors(errorMap);
    }
  }
};



  const handleStaffSubmit = () => {
    try {
      staffSchema.parse(staffData);
      setErrors({});
      handleFinalSubmit();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap: Record<string, string> = {};
        error.issues.forEach((err) => { if (err.path[0]) errorMap[err.path[0].toString()] = err.message; });
        setErrors(errorMap);
      }
    }
  };

    const handleDicomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      setCurrentExam({...currentExam, dicomFiles: [...currentExam.dicomFiles, ...files]});
      e.target.value = ''; 
    };

    const removeDicomFile = (idx: number) => {
      setCurrentExam({...currentExam, dicomFiles: currentExam.dicomFiles.filter((_, i) => i !== idx)});
    };

  const addLabTest = () => {
    if (currentLabTest.testName && currentLabTest.category && currentLabTest.file) {
      setLabTests([...labTests, currentLabTest as {testName: string, category: string, file: File}]);
      setCurrentLabTest({testName: "", category: "", file: null});
      setShowLabModal(false);
    }
  };

  const removeLabTest = (idx: number) => {
    setLabTests(labTests.filter((_, i) => i !== idx));
  };

 const addExam = () => {
  if (currentExam.modality && currentExam.bodyPart ) {
    setExams([...exams, currentExam as any]);
    setCurrentExam({modality: "", bodyPart: "", dicomFiles: []});
    setShowExamModal(false);
  }
};

  const removeExam = (idx: number) => {
    setExams(exams.filter((_, i) => i !== idx));
  };



  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <AdjustableCard className={styles.card} height="100%">
          <div className={styles.cardContent}>
            <h1 className={styles.title}>Register</h1>
            <div className={styles.stepIndicator}>
              <div className={`${styles.stepDot} ${step >= 1 ? styles.active : ""}`}>1</div>
              <div className={styles.stepLine}></div>
              <div className={`${styles.stepDot} ${step >= 2 ? styles.active : ""}`}>2</div>
              {generalData.role === "athlete" && (
                <>
                  <div className={styles.stepLine}></div>
                  <div className={`${styles.stepDot} ${step >= 3 ? styles.active : ""}`}>3</div>
                  <div className={styles.stepLine}></div>
                  <div className={`${styles.stepDot} ${step >= 4 ? styles.active : ""}`}>4</div>
                </>
              )}
            </div>

            {step === 1 && (
              <div className={styles.form}>
                <TextInput label="Full Name" value={generalData.fullName || ""} onChange={(v) => setGeneralData({ ...generalData, fullName: v })} error={errors.fullName} />
                <TextInput label="Email" type="email" value={generalData.email || ""} onChange={(v) => setGeneralData({ ...generalData, email: v })} error={errors.email} />
                <TextInput label="Password" type="password" value={generalData.password || ""} onChange={(v) => setGeneralData({ ...generalData, password: v })} error={errors.password} />
                <div className={styles.radioGroup}>
                  <label className={styles.label}>Gender</label>
                  <div className={styles.radioOptions}>
                    <RadioButton name="gender" value="male" label="Male" checked={generalData.gender === "male"} onChange={() => setGeneralData({ ...generalData, gender: "male" })} />
                    <RadioButton name="gender" value="female" label="Female" checked={generalData.gender === "female"} onChange={() => setGeneralData({ ...generalData, gender: "female" })} />
                  {errors.gender && <span className={styles.errorMessage}>{errors.gender}</span>}
                  </div>
                </div>
                <div className={styles.radioGroup}>
                  <label className={styles.label}>Role</label>
                  <div className={styles.radioOptions}>
                    <RadioButton name="role" value="athlete" label="Athlete" checked={generalData.role === "athlete"} onChange={() => setGeneralData({ ...generalData, role: "athlete" })} />
                    <RadioButton name="role" value="physician" label="Physician" checked={generalData.role === "physician"} onChange={() => setGeneralData({ ...generalData, role: "physician" })} />
                    <RadioButton name="role" value="physiotherapy" label="Physio" checked={generalData.role === "physiotherapy"} onChange={() => setGeneralData({ ...generalData, role: "physiotherapy" })} />
                    {errors.role && <span className={styles.errorMessage}>{errors.role}</span>}

                  </div>
                </div>
                <div className={styles.buttonGroup}>              
                <Button variant="secondary" onClick={handleGeneralSubmit} width="100%">NEXT</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.form}>
                {generalData.role === "athlete" ? (
                  <>
                    <TextInput label="Height (cm)" type="number" value={String(athleteBasicData.height || "")} onChange={(v) => setAthleteBasicData({ ...athleteBasicData, height: Number(v) })} error={errors.height} />
                    <TextInput label="Weight (kg)" type="number" value={String(athleteBasicData.weight || "")} onChange={(v) => setAthleteBasicData({ ...athleteBasicData, weight: Number(v) })} error={errors.weight} />
                      <TextInput 
                        label="Birth Date" 
                        type="date" 
                        max={today}
                        value={athleteBasicData.birthDate || ""} 
                        onChange={(v) => setAthleteBasicData({ ...athleteBasicData, birthDate: v })} 
                        error={errors.birthDate} 
                      />                    
                      <div className={styles.buttonGroup}>
                      <Button variant="secondary" onClick={() => setStep(1)} width="48%">BACK</Button>
                      <Button variant="secondary" onClick={handleAthleteBasicSubmit} width="48%">NEXT</Button>
                    </div>
                  </>
            ) : (
              <>
                <TextInput 
                  label="Birth Date" 
                  type="date" 
                  max={today}
                  value={staffData.birthDate || ""} 
                  onChange={(v) => setStaffData({ ...staffData, birthDate: v })} 
                  error={errors.birthDate} 
                />
                <TextInput label="Position" value={staffData.position || ""} onChange={(v) => setStaffData({ ...staffData, position: v })} error={errors.position} />
                <div className={styles.buttonGroup}>
                  <Button variant="secondary" onClick={() => setStep(1)} width="48%">BACK</Button>
                  <Button variant="secondary" onClick={handleStaffSubmit} width="48%">SUBMIT</Button>
                </div>
              </>
            )}
              </div>
            )}

        {step === 3 && generalData.role === "athlete" && (
          <div className={styles.form}>
            <div className={styles.radioGroup}>
              <label className={styles.label}>Status</label>
              <div className={styles.radioOptions}>
                <RadioButton name="status" value="fit" label="Fit" checked={athleteDetailsData.status === "fit"} onChange={() => setAthleteDetailsData({ ...athleteDetailsData, status: "fit" })} />
                <RadioButton name="status" value="injured" label="Injured" checked={athleteDetailsData.status === "injured"} onChange={() => setAthleteDetailsData({ ...athleteDetailsData, status: "injured" })} />
              {errors.status && <span className={styles.errorMessage}>{errors.status}</span>}
              </div>
            </div>
            
            {athleteDetailsData.status === "injured" && (
              <TextInput 
                label="Diagnosis Name" 
                placeholder="Enter diagnosis name"
                value={athleteDetailsData.diagnosis || ""} 
                onChange={(v) => setAthleteDetailsData({ ...athleteDetailsData, diagnosis: v })} 
                error={errors.diagnosis} 
              />
            )}
            
            <TextInput label="Jersey Number" type="number" value={String(athleteDetailsData.jerseyNumber || "")} onChange={(v) => setAthleteDetailsData({ ...athleteDetailsData, jerseyNumber: Number(v) })} error={errors.jerseyNumber} />

                <TextInput label="Position" value={athleteDetailsData.position || ""} onChange={(v) => setAthleteDetailsData({ ...athleteDetailsData, position: v })} error={errors.position} />
                <div className={styles.buttonGroup}>
                  <Button variant="secondary" onClick={() => setStep(2)} width="48%">BACK</Button>
                  <Button variant="secondary" onClick={handleAthleteDetailsSubmit} width="48%">NEXT</Button>
                </div>
              </div>
            )}

            {step === 4 && generalData.role === "athlete" && (
            <div className={styles.form}>
             <div className={styles.fileUpload}>
            <label className={styles.label}>Lab Tests</label>
              {errors.labTests && <span className={styles.errorMessage}>{errors.labTests}</span>}
            <div className={styles.uploadBox} onClick={() => setShowLabModal(true)} style={{ cursor: 'pointer' }}>
              <span className={styles.uploadLabel}>+ Add Lab Test</span>
              <div className={styles.fileList}>
                {labTests.map((test, idx) => (
                  <div key={idx} className={styles.fileName} onClick={(e) => e.stopPropagation()}>
                    <span className={styles.fileNameText}>{test.testName} ({test.category})</span>
                    <span onClick={() => removeLabTest(idx)} className={styles.removeFileBtn}>✕</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

             <div className={styles.fileUpload}>
              <label className={styles.label}>Imaging Exams</label>
                {errors.exams && <span className={styles.errorMessage}>{errors.exams}</span>}
              <div className={styles.uploadBox} onClick={() => setShowExamModal(true)} style={{ cursor: 'pointer' }}>
                <span className={styles.uploadLabel}>+ Add Exam</span>
                <div className={styles.fileList}>
                  {exams.map((exam, idx) => (
                    <div key={idx} className={styles.fileName} onClick={(e) => e.stopPropagation()}>
                      <span className={styles.fileNameText}>{exam.modality} - {exam.bodyPart}</span>
                      <span onClick={() => removeExam(idx)} className={styles.removeFileBtn}>✕</span>
                    </div>
                  ))}
                </div>
              </div>
              <TextInput
              label="Notes"
              placeholder="Enter medical notes"
              value={notes}
              onChange={(v) => setNotes(v)}
              error={errors.notes}
              height={100}
            />

            </div>

              <div className={styles.buttonGroup}>
                <Button variant="secondary" onClick={() => setStep(3)} width="48%">BACK</Button>
                <Button variant="secondary" onClick={handleAthleteMedicalSubmit } width="48%">{isSubmitting ? "LOADING..." : "SUBMIT"}</Button>
              </div>
            </div>
          )}

          {showLabModal && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <h3>Add Lab Test</h3>
                <TextInput 
                  label="Test Name" 
                  value={currentLabTest.testName} 
                  onChange={(v) => setCurrentLabTest({...currentLabTest, testName: v})} 
                />
               <ComboBox
                  label="Category"
                  options={[
                    { label: "Select Category", value: "" },
                    { label: "Hematology", value: "Hematology" },
                    { label: "Biochemistry", value: "Biochemistry" },
                    { label: "Hormones", value: "Hormones" }
                  ]}
                  value={currentLabTest.category}
                  onChange={(v) => setCurrentLabTest({...currentLabTest, category: v})}
                />
                <div className={styles.fileInputWrapper}>
                  <label className={styles.label}>Upload Result PDF</label>
                  <input 
                    type="file" 
                    onChange={(e) => setCurrentLabTest({...currentLabTest, file: e.target.files?.[0] || null})} 
                    accept=".pdf,.csv,.xlsx,.xls" 
                  />
                </div>
                <div className={styles.buttonGroup}>
                  <Button variant="secondary" onClick={() => setShowLabModal(false)} width="48%">Cancel</Button>
                  <Button variant="secondary" onClick={addLabTest} width="48%">Add</Button>
                </div>
              </div>
            </div>
          )}

          {showExamModal && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <h3>Add Imaging Exam</h3>
                <ComboBox
                  label="Modality (Exam Type)"
                  options={[
                    { label: "Select Modality", value: "" },
                    { label: "MRI", value: "MRI" },
                    { label: "CT", value: "CT" },
                    { label: "X-RAY", value: "X-RAY" },
                    { label: "ULTRASOUND", value: "ULTRASOUND" }
                  ]}
                  value={currentExam.modality}
                  onChange={(v) => setCurrentExam({...currentExam, modality: v})}
                />
                <TextInput 
                  label="Body Part" 
                  placeholder="Knee, Shoulder, Ankle ..."
                  value={currentExam.bodyPart} 
                  onChange={(v) => setCurrentExam({...currentExam, bodyPart: v})} 
                />
                <div className={styles.fileInputWrapper}>
                  <label className={styles.label}>DICOM Files</label>
                  <input 
                    type="file" 
                    multiple 
                    id="examDicom"
                    onChange={handleDicomUpload} 
                    accept=".dcm,.dicom" 
                  />
                  {currentExam.dicomFiles.length > 0 && (
                    <div className={styles.fileList} style={{marginTop: '0.5rem'}}>
                      {currentExam.dicomFiles.map((file, idx) => (
                        <div key={idx} className={styles.fileName}>
                          <span className={styles.fileNameText}>{file.name}</span>
                          <span onClick={() => removeDicomFile(idx)} className={styles.removeFileBtn}>✕</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className={styles.buttonGroup}>
                  <Button variant="secondary" onClick={() => setShowExamModal(false)} width="48%">Cancel</Button>
                  <Button variant="secondary" onClick={addExam} width="48%">Add</Button>
                </div>
              </div>
            </div>
          )}
          </div>
        </AdjustableCard>
      </div>
    </div>
  );
}

export default RegisterView;