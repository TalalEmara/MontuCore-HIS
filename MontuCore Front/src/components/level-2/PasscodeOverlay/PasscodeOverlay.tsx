import React, { useState } from "react";
import TextInput from "../../level-0/TextInput/TextInput";
import Button from "../../level-0/Button/Bottom";
import styles from "./PasscodeOverlay.module.css";

interface PasscodeOverlayProps {
  isOpen: boolean;
  onSuccess: (code: string) => void;
  error?: string;
}

const PasscodeOverlay: React.FC<PasscodeOverlayProps> = ({ 
  isOpen, 
  onSuccess,
  error: apiError 
}) => {
  const [passcode, setPasscode] = useState("");
  const [localError, setLocalError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.length > 0) {
      setLocalError("");
      onSuccess(passcode); 
    } else {
      setLocalError("Please enter a passcode.");
    }
  };

  return (
    <div className={styles.passcodeOverlay}>
      <div className={styles.passcodeCard}>
        <h2>External Consultation</h2>
        <p>Enter your passkey</p>
        
        <form onSubmit={handleSubmit}>
          <TextInput
            placeholder="Enter passcode..."
            value={passcode}
            onChange={(val) => {
              setPasscode(val);
              setLocalError("");
            }}
            type="password"
            error={apiError || localError}
          />
          
          <div style={{ marginTop: "1.5rem" }}>
            <Button type="submit" variant="primary" height="40px">
              ENTER
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasscodeOverlay;