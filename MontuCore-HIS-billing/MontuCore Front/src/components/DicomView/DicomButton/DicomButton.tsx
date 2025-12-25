import React from "react";
import styles from "./DicomButton.module.css";
type DicomButtonProps = {
  isActive?: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
};

function DicomButton({ isActive, onClick, label, icon }: DicomButtonProps) {




    
  return (
    <button
      onClick={onClick}
      title={label} 
      className={`${styles.dicomButton} ${isActive ? styles.active : ''}`}>
        {icon}
        <span>{label}</span>
      </button>
    
);}

export default DicomButton;
