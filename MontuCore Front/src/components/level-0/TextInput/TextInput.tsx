import React from "react";
import "./TextInput.css";

interface TextInputProps {
  label?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
  height?: string | number;
  max?: string; 
  min?: string;
}

const TextInput: React.FC<TextInputProps> = ({ 
  label, 
  value, 
  placeholder, 
  onChange, 
  type = "text", 
  error,
  height,
  max, 
  min  
}) => {
  const isMultiline = height !== undefined;

  return (
    <div className="text-input-wrapper">
      {label && <label>{label}</label>}
      
      {isMultiline ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={error ? "error" : ""}
          style={{ 
            height: height, 
            paddingTop: '12px', 
            resize: 'none',
            backgroundColor: 'var(--background-color)' 
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          max={max} 
          min={min} 
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={error ? "error" : ""}
        />
      )}

      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default TextInput;