import React from 'react';
import { 
  Maximize, 
  Move, 
  Search, 
  Sun, 
  Ruler, 
  RotateCcw, 
  Grid, 
  Link,
  Camera,
  Layers,
  Triangle
} from 'lucide-react'; // Using Lucide for clean medical-style icons

// --- Types ---
export type ToolMode = 'WindowLevel' | 'Pan' | 'Zoom' | 'Length' | 'Angle' | 'StackScroll';

interface DicomTopBarProps {
  activeTool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  isSyncActive: boolean;
  onToggleSync: () => void;
  onLayoutChange: (cols: number, rows: number) => void;
  onReset: () => void;
}

// --- Helper for Button Styles ---
const Button: React.FC<{
  isActive?: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}> = ({ isActive, onClick, label, icon }) => (
  <button
    onClick={onClick}
    title={label}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px 12px',
      margin: '0 2px',
      background: isActive ? '#3b82f6' : '#27272a', // Blue if active, Dark Gray if not
      color: 'white',
      border: '1px solid #3f3f46',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.75rem',
      transition: 'all 0.2s',
      minWidth: '60px'
    }}
  >
    <div style={{ marginBottom: '4px' }}>{icon}</div>
    <span>{label}</span>
  </button>
);

const Divider = () => (
  <div style={{ width: '1px', background: '#52525b', margin: '0 8px', height: '30px' }} />
);

export const DicomTopBar: React.FC<DicomTopBarProps> = ({
  activeTool,
  onToolChange,
  isSyncActive,
  onToggleSync,
  onLayoutChange,
  onReset
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '10px 20px',
      background: '#18181b', // Dark background for medical apps
      borderBottom: '1px solid #3f3f46',
      overflowX: 'auto'
    }}>
      
      {/* GROUP 1: ADJUSTMENT */}
      <Button 
        label="Contrast" 
        icon={<Sun size={18} />} 
        isActive={activeTool === 'WindowLevel'} 
        onClick={() => onToolChange('WindowLevel')} 
      />
      <Button 
        label="Reset" 
        icon={<RotateCcw size={18} />} 
        onClick={onReset} 
      />

      <Divider />

      {/* GROUP 2: NAVIGATION */}
      <Button 
        label="Pan" 
        icon={<Move size={18} />} 
        isActive={activeTool === 'Pan'} 
        onClick={() => onToolChange('Pan')} 
      />
      <Button 
        label="Zoom" 
        icon={<Search size={18} />} 
        isActive={activeTool === 'Zoom'} 
        onClick={() => onToolChange('Zoom')} 
      />
      <Button 
        label="Scroll" 
        icon={<Layers size={18} />} 
        isActive={activeTool === 'StackScroll'} 
        onClick={() => onToolChange('StackScroll')} 
      />

      <Divider />

      {/* GROUP 3: MEASUREMENTS (Crucial for Athletes) */}
      <Button 
        label="Length" 
        icon={<Ruler size={18} />} 
        isActive={activeTool === 'Length'} 
        onClick={() => onToolChange('Length')} 
      />
      <Button 
        label="Angle" 
        icon={<Triangle size={18} />} 
        isActive={activeTool === 'Angle'} 
        onClick={() => onToolChange('Angle')} 
      />

      <Divider />

      {/* GROUP 4: LAYOUT & SYNC */}
      <Button 
        label="Sync" 
        icon={<Link size={18} />} 
        isActive={isSyncActive} 
        onClick={onToggleSync} 
      />
      
      {/* Layout Dropdown Simulation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '5px' }}>
         <button 
           onClick={() => onLayoutChange(1, 1)}
           style={{ background: '#27272a', border: '1px solid #555', color: '#fff', fontSize: '10px', cursor: 'pointer' }}
         >
           [ ] 1x1
         </button>
         <button 
           onClick={() => onLayoutChange(2, 1)}
           style={{ background: '#27272a', border: '1px solid #555', color: '#fff', fontSize: '10px', cursor: 'pointer' }}
         >
           [ ][ ] 1x2
         </button>
      </div>

    </div>
  );
};export default DicomTopBar;