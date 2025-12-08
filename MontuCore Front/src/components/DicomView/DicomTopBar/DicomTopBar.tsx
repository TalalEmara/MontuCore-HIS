import React from "react";
import {
  Move,
  Search,
  Sun,
  Ruler,
  RotateCcw,
  Layers,
  Triangle,
  Plus,  // Added
  Minus, // Added
} from "lucide-react";
import DicomButton from "../DicomButton/DicomButton";
import styles from "./DicomTopBar.module.css";

// --- Types ---
export type ToolMode =
  | "WindowLevel"
  | "Pan"
  | "Zoom"
  | "Length"
  | "Angle"
  | "StackScroll";

interface DicomTopBarProps {
  activeTool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  isSyncActive: boolean;
  onAddViewport?: () => void;
  onRemoveViewport?: () => void;
}

const Divider = () => <div className={styles.divider} />;

export const DicomTopBar: React.FC<DicomTopBarProps> = ({
  activeTool,
  onToolChange,
  onAddViewport,    
  onRemoveViewport, 
}) => {
  const iconSize = 20;
  return (
    <div className={styles.dicomTopBar}>
      {/* GROUP 1: ADJUSTMENT */}
      <DicomButton
        label="Contrast"
        icon={<Sun size={iconSize} />}
        isActive={activeTool === "WindowLevel"}
        onClick={() => onToolChange("WindowLevel")}
      />

      <Divider />

      {/* GROUP 2: NAVIGATION */}
      <DicomButton
        label="Pan"
        icon={<Move size={iconSize} />}
        isActive={activeTool === "Pan"}
        onClick={() => onToolChange("Pan")}
      />
      <DicomButton
        label="Zoom"
        icon={<Search size={iconSize} />}
        isActive={activeTool === "Zoom"}
        onClick={() => onToolChange("Zoom")}
      />
      <DicomButton
        label="Scroll"
        icon={<Layers size={iconSize} />}
        isActive={activeTool === "StackScroll"}
        onClick={() => onToolChange("StackScroll")}
      />

      <Divider />

      {/* GROUP 3: MEASUREMENTS */}
      <DicomButton
        label="Length"
        icon={<Ruler size={iconSize} />}
        isActive={activeTool === "Length"}
        onClick={() => onToolChange("Length")}
      />
      <DicomButton
        label="Angle"
        icon={<Triangle size={iconSize} />}
        isActive={activeTool === "Angle"}
        onClick={() => onToolChange("Angle")}
      />

      <Divider />

      {/* GROUP 4: LAYOUT & SYNC */}
      {/* <DicomButton
        label="Sync"
        icon={<Link size={iconSize} />}
        isActive={isSyncActive}
        onClick={onToggleSync}
      /> */}
      
      {/* Dynamic Viewport Controls */}
      <DicomButton
        label="Add View"
        icon={<Plus size={iconSize} />}
        onClick={onAddViewport}
      />
      <DicomButton
        label="Less View"
        icon={<Minus size={iconSize} />}
        onClick={onRemoveViewport}
      />

      <p className={styles.atheleteName}> Athelete Athelete </p>
    </div>
  );
};
export default DicomTopBar;