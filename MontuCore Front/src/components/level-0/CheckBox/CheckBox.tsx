import React from "react";
import "./Checkbox.css";

interface CheckboxProps {
  label: string;                
  checked: boolean;            
  onChange: (value: boolean) => void; 
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <label className="checkbox-wrapper">
      <input
        type="checkbox"
        checked={checked}               
        onChange={(e) => onChange(e.target.checked)}
      />
      {label && <span>{label}</span>}   
    </label>
  );
};

export default Checkbox;
