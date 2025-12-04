import React from "react";
import "./TextInput.css";

interface TextInputProps {
  label?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, placeholder, onChange, type = "text", error }) => {
  return (
    <div className="text-input-wrapper">
      {label && <label>{label}</label>}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "error" : ""}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default TextInput;
