
import React from "react";
import {
  Move, Search, Sun, Ruler, Layers, Triangle, Plus, Minus,
  Activity, 
} from "lucide-react";
import DicomButton from "../DicomButton/DicomButton";
import styles from "./DicomTopBar.module.css";
// Import the Type from Viewer if shared, or redefine
import { type VoiPreset } from "../../level-1/DicomViewer/DicomViewer";

export type ToolMode = "WindowLevel" | "Pan" | "Zoom" | "Length" | "Angle" | "StackScroll";

// Define Standard Medical Presets
// "Sharpening" = Lung/Bone (High Contrast)
// "Smoothing" = Soft Tissue (Low Contrast)
export const PRESETS: VoiPreset[] = [
  { id: 'soft-tissue', label: 'Soft Tissue (Smooth)', windowWidth: 400, windowCenter: 40 },
  { id: 'lung', label: 'Lung (Sharpen)', windowWidth: 1500, windowCenter: -600 },
  { id: 'bone', label: 'Bone (Detail)', windowWidth: 2500, windowCenter: 480 },
  { id: 'brain', label: 'Brain', windowWidth: 80, windowCenter: 40 },
];

interface DicomTopBarProps {
  activeTool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  isSyncActive: boolean;
  onAddViewport?: () => void;
  onRemoveViewport?: () => void;
  
  // --- NEW: Preset Handler ---
  onPresetChange: (preset: VoiPreset) => void;
}

const Divider = () => <div className={styles.divider} />;

export const DicomTopBar: React.FC<DicomTopBarProps> = ({
  activeTool,
  onToolChange,
  onAddViewport,    
  onRemoveViewport,
  onPresetChange // New Prop
}) => {
  const iconSize = 20;

  return (
    <div className={styles.dicomTopBar}>
      {/* GROUP 1: ADJUSTMENT & FILTERS */}
      <DicomButton
        label="Contrast"
        icon={<Sun size={iconSize} />}
        isActive={activeTool === "WindowLevel"}
        onClick={() => onToolChange("WindowLevel")}
      />
      
      {/* PRESETS DROPDOWN (Simplified as a select for now) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 5px' }}>
        <Activity size={16} color="#a1a1aa" style={{ marginBottom: 2 }} />
        <select 
          onChange={(e) => {
            const selected = PRESETS.find(p => p.id === e.target.value);
            if (selected) onPresetChange(selected);
          }}
          style={{
            background: '#27272a', color: 'white', border: '1px solid #555',
            fontSize: '10px', padding: '2px', borderRadius: '4px', maxWidth: '80px'
          }}
        >
          <option value="">Filters...</option>
          {PRESETS.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </div>

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

      {/* GROUP 4: VIEWPORTS */}
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