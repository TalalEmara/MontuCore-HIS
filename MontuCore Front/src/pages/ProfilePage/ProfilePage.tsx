import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import TopBar from "../../components/level-1/TopBar/TopBar";
import AdjustableCard from "../../components/level-1/AdjustableCard/AdjustableCard";
import TextInput from "../../components/level-0/TextInput/TextInput";
import Button from "../../components/level-0/Button/Bottom";
import styles from "./ProfilePage.module.css";

// Interface for the local form state matches your AuthContext types
interface ProfileFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  // Role specific
  position: string;
  jerseyNumber: string;
  specialty: string;
}

function ProfilePage() {
  const { user, profile, login, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize form data
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    position: "",
    jerseyNumber: "",
    specialty: "",
  });

  // Sync state when context changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        gender: user.gender || "",
        position: profile?.position || "",
        jerseyNumber: profile?.jerseyNumber?.toString() || "",
        specialty: profile?.specialty || "",
      });
    }
  }, [user, profile]);

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // --- SIMULATE API CALL ---
      await new Promise((resolve) => setTimeout(resolve, 800));

      // --- UPDATE CONTEXT ---
      if (user && token) {
        const updatedUser = {
          ...user,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
        };

        const updatedProfile = profile
          ? {
              ...profile,
              position: formData.position,
              jerseyNumber: Number(formData.jerseyNumber),
              specialty: formData.specialty,
            }
          : null;

        login(token, updatedUser, updatedProfile);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        gender: user.gender || "",
        position: profile?.position || "",
        jerseyNumber: profile?.jerseyNumber?.toString() || "",
        specialty: profile?.specialty || "",
      });
    }
    setIsEditing(false);
  };

  // Helper to render fields dynamically based on Edit Mode
  const renderField = (
    label: string,
    fieldKey: keyof ProfileFormData,
    type: string = "text",
    placeholder: string = "",
    disabled: boolean = false
  ) => {
    return (
      <div className={styles.fieldContainer}>
        <label className={styles.label}>{label}</label>
        {isEditing && !disabled ? (
          <TextInput
            value={formData[fieldKey]}
            onChange={(val) => handleChange(fieldKey, val)}
            type={type}
            placeholder={placeholder}
          />
        ) : (
          <div className={styles.valueDisplay}>
            {formData[fieldKey] ? (
              formData[fieldKey]
            ) : (
              <span className={styles.emptyValue}>Not set</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <TopBar
        Name={user?.fullName}
        Role={profile?.position || user?.role}
        jerseyNumber={profile?.jerseyNumber}
      />

      <div className={styles.contentWrapper}>
        <AdjustableCard className={styles.profileCard} width="900px" height="auto">
          
          {/* Header Section */}
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>MY PROFILE</h1>
              <p style={{ color: "var(--accent)", margin: "0.5rem 0 0 0", fontWeight: 600 }}>
                Manage your personal information
              </p>
            </div>
            
            {!isEditing && (
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
                width="140px"
              >
                EDIT PROFILE
              </Button>
            )}
          </div>

          {/* Form Content */}
          <div className={styles.formContent}>
            
            <div className={styles.sectionTitle}>General Information</div>
            <div className={styles.formGrid}>
              {renderField("Full Name", "fullName", "text", "Enter full name")}
              {renderField("Email Address", "email", "email", "", true)} {/* Email usually disabled */}
              {renderField("Phone Number", "phoneNumber", "tel", "+1 234 567 890")}
              {renderField("Date of Birth", "dateOfBirth", "date")}
              {renderField("Gender", "gender", "text")}
            </div>

            {/* Role Specific Sections */}
            {user?.role === "ATHLETE" && (
              <>
                <div className={styles.sectionTitle}>Athlete Stats</div>
                <div className={styles.formGrid}>
                  {renderField("Position", "position", "text", "e.g. Forward")}
                  {renderField("Jersey Number", "jerseyNumber", "number", "e.g. 10")}
                </div>
              </>
            )}

            {(user?.role === "CLINICIAN" || user?.role === "ADMIN") && (
              <>
                <div className={styles.sectionTitle}>Professional Details</div>
                <div className={styles.formGrid}>
                  {renderField("Job Title", "position", "text", "e.g. Senior Physiotherapist")}
                  {renderField("Specialty", "specialty", "text", "e.g. Sports Medicine")}
                </div>
              </>
            )}

            {/* Edit Mode Actions */}
            {isEditing && (
              <div className={styles.buttonGroup}>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  width="120px"
                >
                  CANCEL
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  width="180px"
                  disabled={loading}
                >
                  {loading ? "SAVING..." : "SAVE CHANGES"}
                </Button>
              </div>
            )}
          </div>

        </AdjustableCard>
      </div>
    </div>
  );
}

export default ProfilePage;