import React, { useState, useEffect, useRef } from 'react';
import DicomTopBar, { type ToolMode } from '../../components/DicomView/DicomTopBar/DicomTopBar';
import DicomViewer from '../../components/level-1/DicomViewer/DicomViewer'; 
// Adjust this import path to where you stored the hook
import { useDicomFileHandler } from '../../hooks/DicomViewer/useDicomFileHandler'; 
import { Upload } from 'lucide-react'; // Icon for the upload button

// Mock Data for initial state (optional)
const MOCK_SERIES_1: string[] = []; 
const MOCK_SERIES_2: string[] = []; 

function DicomViewPage() {
  // --- STATE ---
  const [activeTool, setActiveTool] = useState<ToolMode>('WindowLevel');
  const [isSyncActive, setIsSyncActive] = useState(false);
  const [gridLayout, setGridLayout] = useState({ cols: 1, rows: 1 });
  
  // Track which viewport is currently selected (defaults to 'left')
  const [activeViewportId, setActiveViewportId] = useState<'left' | 'right'>('left');

  // Viewport Data: Maps 'left'/'right' to arrays of image IDs
  const [viewportsData, setViewportsData] = useState({
    left: MOCK_SERIES_1,
    right: MOCK_SERIES_2
  });

  // --- HOOKS ---
  // We use your custom hook to handle the file processing
  const { imageIds: uploadedImageIds, handleFileChange } = useDicomFileHandler();

  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EFFECT: Handle New Uploads ---
  // When the hook processes new files, assign them to the ACTIVE viewport
  useEffect(() => {
    if (uploadedImageIds && uploadedImageIds.length > 0) {
      setViewportsData(prev => ({
        ...prev,
        [activeViewportId]: uploadedImageIds
      }));
    }
  }, [uploadedImageIds, activeViewportId]);

  // --- HANDLERS ---
  const handleToolChange = (toolName: ToolMode) => {
    setActiveTool(toolName);
  };

  const handleLayoutChange = (cols: number, rows: number) => {
    setGridLayout({ cols, rows });
  };

  const toggleSync = () => {
    setIsSyncActive(!isSyncActive);
  };

  const handleReset = () => {
     console.log("Resetting viewports...");
     // In a real app, you might use a specific service or context to trigger resets
  };

  // Helper to trigger the hidden file input
  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // --- STYLES ---
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`,
    gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
    gap: '4px',
    height: 'calc(100vh - 120px)', // Adjust height to account for toolbar + upload bar
    backgroundColor: '#000',
    padding: '4px'
  };

  const activeBorderStyle = '2px solid #3b82f6'; // Blue border for active
  const inactiveBorderStyle = '1px solid #333';  // Dark gray for inactive

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#09090b', color: 'white' }}>
      
      {/* 1. TOP BAR */}
      <DicomTopBar 
        activeTool={activeTool}
        onToolChange={handleToolChange}
        isSyncActive={isSyncActive}
        onToggleSync={toggleSync}
        onLayoutChange={handleLayoutChange}
        onReset={handleReset}
        // You could pass the gridLayout here if your TopBar needs it for button states
        // gridLayout={gridLayout} 
      />

      {/* 2. UPLOAD SECTION (New) */}
      <div style={{ padding: '8px 16px', background: '#18181b', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: '10px' }}>
         <input 
            ref={fileInputRef}
            type="file" 
            multiple 
            accept=".dcm" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
         />
         
         <button 
            onClick={triggerUpload}
            style={{
               display: 'flex', alignItems: 'center', gap: '6px',
               background: '#2563eb', color: 'white', border: 'none',
               padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem'
            }}
         >
            <Upload size={16} />
            Upload DICOM to {activeViewportId === 'left' ? 'Left' : 'Right'} View
         </button>

         <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>
            Selected: <strong style={{color: '#fff', textTransform:'capitalize'}}>{activeViewportId} Viewport</strong>
         </span>
      </div>

      {/* 3. VIEWPORT GRID */}
      <div style={gridStyle}>
        
        {/* Viewport 1 (Left / Main) */}
        <div 
            onClick={() => setActiveViewportId('left')}
            style={{ 
               border: activeViewportId === 'left' ? activeBorderStyle : inactiveBorderStyle, 
               position: 'relative', width: '100%', height: '100%', cursor: 'pointer' 
            }}
        >
            <DicomViewer 
                viewportId="viewport-1"
                imageIds={viewportsData.left} 
                activeTool={activeTool}
            />
            <span style={{position:'absolute', top:5, left:5, color: '#3b82f6', fontSize:'12px', pointerEvents:'none', fontWeight:'bold'}}>
                Series A (Left) {activeViewportId === 'left' && '●'}
            </span>
        </div>

        {/* Viewport 2 (Right - Only if grid allows) */}
        {gridLayout.cols > 1 && (
            <div 
               onClick={() => setActiveViewportId('right')}
               style={{ 
                  border: activeViewportId === 'right' ? activeBorderStyle : inactiveBorderStyle, 
                  position: 'relative', width: '100%', height: '100%', cursor: 'pointer' 
               }}
            >
                <DicomViewer 
                    viewportId="viewport-2"
                    imageIds={viewportsData.right} 
                    activeTool={activeTool} 
                />
                <span style={{position:'absolute', top:5, left:5, color: '#3b82f6', fontSize:'12px', pointerEvents:'none', fontWeight:'bold'}}>
                    Series B (Right) {activeViewportId === 'right' && '●'}
                </span>
            </div>
        )}

      </div>
    </div>
  );
}

export default DicomViewPage;