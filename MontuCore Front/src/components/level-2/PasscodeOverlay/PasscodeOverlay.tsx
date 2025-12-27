import React, { useState } from "react";
import TextInput from "../../level-0/TextInput/TextInput";
import Button from "../../level-0/Button/Bottom";
import styles from "./PasscodeOverlay.module.css";

interface PasscodeOverlayProps {
  isOpen: boolean;
  correctPasscode: string;
  onSuccess: () => void;
}

const PasscodeOverlay: React.FC<PasscodeOverlayProps> = ({ 
  isOpen, 
  correctPasscode, 
  onSuccess 
}) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === correctPasscode) {
      setError("");
      onSuccess();
    } else {
      setError("Incorrect passcode. Please try again.");
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
              if (error) setError(""); 
            }}
            type="password"
            error={error}
          />
          
          <div style={{ marginTop: "1.5rem" }}>
            <Button 
              type="submit" 
              variant="primary" 
              height="40px"
            >
              ENTER
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasscodeOverlay;