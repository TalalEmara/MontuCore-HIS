import React from "react";
import "./Bottom.css";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  width?: string;
  height?: string;
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  width = "auto",
  height = "auto",
  className = "",
  disabled = false,
}) => {
  return (
    <button
      className={`shared-button ${variant} ${className}`}
      style={{ width, height }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
