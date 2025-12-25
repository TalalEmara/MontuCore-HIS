import React from "react";
import "./RadioButton.css";

interface RadioButtonProps {
  label: string;
  value: string;
  name: string; 
  checked: boolean;
  onChange: (value: string) => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({ label, value, name, checked, onChange }) => {
  return (
    <label className="radio-wrapper">
      <input
        type="radio"
        name={name}      
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.value)} 
      />
      {label && <span>{label}</span>}
    </label>
  );
};

export default RadioButton;
