import React from "react";
import "./ComboBox.css";

interface ComboBoxProps {
  label?: string;
  options: { label: string; value: number | string }[];
  value: number | string;
  onChange: (value: string) => void;
}

const ComboBox: React.FC<ComboBoxProps> = ({ label, options, value, onChange }) => {
  return (
    <div className="combo-container">
      {label && <label>{label}</label>}

      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

export default ComboBox;
