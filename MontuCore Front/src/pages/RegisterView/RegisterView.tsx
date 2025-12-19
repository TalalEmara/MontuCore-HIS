import { useState } from "react";
import { z } from "zod";
import TextInput from "../../components/level-0/TextInput/TextInput";
import Button from "../../components/level-0/Button/Bottom";
import RadioButton from "../../components/level-0/RadioButton/RadioButton";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import styles from "./RegisterView.module.css";

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
  jerseyNumber: z.number({ message: "This field is required" })
    .min(1)
    .max(99),
    position: z.string().min(2, "Position is required"),
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
  const [dicomFiles, setDicomFiles] = useState<File[]>([]);
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [labTestFiles, setLabTestFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "dicom" | "reports" | "labTests") => {
    const files = Array.from(e.target.files || []);
    if (type === "dicom") setDicomFiles([...dicomFiles, ...files]);
    else if (type === "reports") setReportFiles([...reportFiles, ...files]);
    else setLabTestFiles([...labTestFiles, ...files]);
    e.target.value = ''; 
  };

  const removeFile = (idx: number, type: "dicom" | "reports" | "labTests") => {
    if (type === "dicom") setDicomFiles(dicomFiles.filter((_, i) => i !== idx));
    else if (type === "reports") setReportFiles(reportFiles.filter((_, i) => i !== idx));
    else setLabTestFiles(labTestFiles.filter((_, i) => i !== idx));
  };

const handleFinalSubmit = async () => {
    let submissionData: any = {
      fullName: generalData.fullName,
      email: generalData.email,
      password: generalData.password,
      gender: generalData.gender,
      role: generalData.role,
    };
    
    if (generalData.role === 'athlete') {
      submissionData = {
        ...submissionData,
        height: athleteBasicData.height,
        weight: athleteBasicData.weight,
        birthDate: athleteBasicData.birthDate,
        status: athleteDetailsData.status,
        jerseyNumber: athleteDetailsData.jerseyNumber,
        position: athleteDetailsData.position,
        files: {
          dicom: dicomFiles.map(f => f.name),
          reports: reportFiles.map(f => f.name),
          labTests: labTestFiles.map(f => f.name),
        }
      };
      
      console.log('Athlete Registration Data:', submissionData);
      
    } else if (generalData.role === 'physician' || generalData.role === 'physiotherapy') {
    submissionData = {
      ...submissionData,
      birthDate: staffData.birthDate, 
      position: staffData.position,
    };
      
      console.log('Staff Registration Data:', submissionData);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <AdjustableCard className={styles.card} height="auto">
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
                <Button variant="primary" onClick={handleGeneralSubmit} width="100%">NEXT</Button>
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
                      <Button variant="primary" onClick={handleAthleteBasicSubmit} width="48%">NEXT</Button>
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
                  <Button variant="primary" onClick={handleStaffSubmit} width="48%">SUBMIT</Button>
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
                <TextInput label="Jersey Number" type="number" value={String(athleteDetailsData.jerseyNumber || "")} onChange={(v) => setAthleteDetailsData({ ...athleteDetailsData, jerseyNumber: Number(v) })} error={errors.jerseyNumber} />
                <TextInput label="Position" value={athleteDetailsData.position || ""} onChange={(v) => setAthleteDetailsData({ ...athleteDetailsData, position: v })} error={errors.position} />
                <div className={styles.buttonGroup}>
                  <Button variant="secondary" onClick={() => setStep(2)} width="48%">BACK</Button>
                  <Button variant="primary" onClick={handleAthleteDetailsSubmit} width="48%">NEXT</Button>
                </div>
              </div>
            )}

            {step === 4 && generalData.role === "athlete" && (
              <div className={styles.form}>
                <div className={styles.fileUploadGrid}>
                  <div className={styles.fileUpload}>
                    <label className={styles.label}>DICOM</label>
                    <div className={styles.uploadBox}>
                      <input type="file" multiple id="dicom" className={styles.fileInput} onChange={(e) => handleFileUpload(e, "dicom")} accept=".dcm,.dicom" />
                      <label htmlFor="dicom" className={styles.uploadLabel}>+ Upload DICOM</label>
                      <div className={styles.fileList}>
                        {dicomFiles.map((file, idx) => (
                          <div key={idx} className={styles.fileName}>
                            <span className={styles.fileNameText}>{file.name}</span>
                            <span onClick={() => removeFile(idx, "dicom")} className={styles.removeFileBtn}>✕</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.fileUpload}>
                    <label className={styles.label}>Reports</label>
                    <div className={styles.uploadBox}>
                      <input type="file" multiple id="reports" className={styles.fileInput} onChange={(e) => handleFileUpload(e, "reports")} accept=".pdf,.doc,.docx" />
                      <label htmlFor="reports" className={styles.uploadLabel}>+ Upload Reports</label>
                      <div className={styles.fileList}>
                        {reportFiles.map((file, idx) => (
                          <div key={idx} className={styles.fileName}>
                            <span className={styles.fileNameText}>{file.name}</span>
                            <span onClick={() => removeFile(idx, "reports")} className={styles.removeFileBtn}>✕</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.fileUpload}>
                    <label className={styles.label}>Lab Tests</label>
                    <div className={styles.uploadBox}>
                      <input type="file" multiple id="labTests" className={styles.fileInput} onChange={(e) => handleFileUpload(e, "labTests")} accept=".pdf,.csv,.xlsx,.xls" />
                      <label htmlFor="labTests" className={styles.uploadLabel}>+ Upload Lab Tests</label>
                      <div className={styles.fileList}>
                        {labTestFiles.map((file, idx) => (
                          <div key={idx} className={styles.fileName}>
                            <span className={styles.fileNameText}>{file.name}</span>
                            <span onClick={() => removeFile(idx, "labTests")} className={styles.removeFileBtn}>✕</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.buttonGroup}>
                  <Button variant="secondary" onClick={() => setStep(3)} width="48%">BACK</Button>
                  <Button variant="primary" onClick={handleFinalSubmit} width="48%">SUBMIT</Button>
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