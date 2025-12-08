import React from "react";
import styles from "./Slider.module.css";

interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  marks?: string[];
  error?: string;
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  marks = [],
  error,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={styles.sliderContainer}>
      {label && <label className={styles.label}>{label}: {value}/{max}</label>}
      <input
        type="range"
        min={min}
        max={max}
        className={styles.slider}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${percentage}%, var(--hover-bg) ${percentage}%, var(--hover-bg) 100%)`
        }}
      />
      {marks.length > 0 && (
        <div className={styles.sliderLabels}>
          {marks.map((mark, idx) => (
            <span key={idx}>{mark}</span>
          ))}
        </div>
      )}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default Slider;
