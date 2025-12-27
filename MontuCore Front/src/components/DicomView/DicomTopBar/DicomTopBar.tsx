import React from "react";
import {
  Move, Search, Sun, Ruler, Layers, Triangle, Plus, Minus,
  Activity,
  SwitchCamera,
  Grid, // New Icon
  Box,  // New Icon
} from "lucide-react";
import DicomButton from "../DicomButton/DicomButton";
import styles from "./DicomTopBar.module.css";
// Import the Type from Viewer if shared, or redefine
import { type VoiPreset } from "../../level-1/DicomViewer/DicomViewer";

export type ToolMode = "WindowLevel" | "Pan" | "Zoom" | "Length" | "Angle" | "StackScroll";
export type ViewMode = 'stack' | 'mpr' | '3d'; // NEW TYPE

// Define Standard Medical Presets
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
  
  // UPDATED: Replaced simple switch with mode change
  viewMode?: ViewMode; 
  onViewModeChange?: (mode: ViewMode) => void; 
  
  onPresetChange: (preset: VoiPreset) => void;
}

const Divider = () => <div className={styles.divider} />;

export const DicomTopBar: React.FC<DicomTopBarProps> = ({
  activeTool,
  onToolChange,
  onAddViewport,    
  onRemoveViewport,
  onPresetChange,
  viewMode = 'stack', // Default
  onViewModeChange,
}) => {
  const iconSize = 20;

  // Helper to handle the cycle
  const handleSwitchClick = () => {
    if (!onViewModeChange) return;
    if (viewMode === 'stack') onViewModeChange('mpr');
    else if (viewMode === 'mpr') onViewModeChange('3d');
    else onViewModeChange('stack');
  };

  // Helper for Button Appearance
  const getSwitchProps = () => {
    switch (viewMode) {
      case 'stack': return { label: "To MPR", icon: <Grid size={iconSize} /> };
      case 'mpr': return { label: "To 3D", icon: <Box size={iconSize} /> };
      case '3d': return { label: "To 2D", icon: <Layers size={iconSize} /> };
      default: return { label: "Switch", icon: <SwitchCamera size={iconSize} /> };
    }
  };

  const switchBtn = getSwitchProps();

  return (
    <div className={styles.dicomTopBar}>
      {/* UPDATED SWITCH BUTTON */}
      <DicomButton
        label={switchBtn.label}
        icon={switchBtn.icon}
        onClick={handleSwitchClick}
        isActive={true} // Highlighted to show it's a main action
      />
      
      {/* GROUP 1: ADJUSTMENT & FILTERS */}
      <DicomButton
        label="Contrast"
        icon={<Sun size={iconSize} />}
        isActive={activeTool === "WindowLevel"}
        onClick={() => onToolChange("WindowLevel")}
      />
      
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
      {/* Disable 2D tools if in 3D mode (optional, but good UX) */}
      {viewMode !== '3d' && (
        <>
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
        </>
      )}

     

      {/* GROUP 3: MEASUREMENTS */}
      {viewMode === 'stack' && (
        <>
         <Divider />
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
        onClick={onAddViewport|| (() => {})}
      />
      <DicomButton
        label="Less View"
        icon={<Minus size={iconSize} />}
        onClick={onRemoveViewport|| (() => {})}
      />
        </>
        
      )}

      

      <p className={styles.atheleteName}> Athelete Athelete </p>
    </div>
  );
};
export default DicomTopBar;