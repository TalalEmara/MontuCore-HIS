
import React, { useState, useEffect, useRef } from "react";
import DicomTopBar, { type ToolMode } from "../../components/DicomView/DicomTopBar/DicomTopBar";
import DicomViewer, { type VoiPreset } from "../../components/level-1/DicomViewer/DicomViewer"; // Import Type
import { useDicomFileHandler } from "../../hooks/DicomViewer/useDicomFileHandler";
import { Upload } from "lucide-react";
import styles from "./DicomViewPage.module.css";

interface ViewportData {
  id: string;
  imageIds: string[];
  // --- NEW: Track preset per viewport ---
  preset?: VoiPreset | null;
}

function DicomViewPage() {
  const [activeTool, setActiveTool] = useState<ToolMode>("WindowLevel");

  const [viewports, setViewports] = useState<ViewportData[]>([
    { id: "viewport-0", imageIds: [], preset: null }, 
  ]);

  const [activeViewportId, setActiveViewportId] = useState<string>("viewport-0");

  // --- HANDLER: Upload ---
  const handleNewDicomFiles = (newImageIds: string[]) => {
    setViewports((prev) =>
      prev.map((vp) => {
        if (vp.id === activeViewportId) {
          return { ...vp, imageIds: newImageIds };
        }
        return vp;
      })
    );
  };

  const { handleFileChange } = useDicomFileHandler(handleNewDicomFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ACTIONS ---
  const handleAddViewport = () => {
    if(viewports.length === 12) return;
    const newId = `viewport-${Date.now()}`;
    // Copy imageIds from active to new (optional convenience) or start empty
    setViewports((prev) => [...prev, { id: newId, imageIds: [], preset: null }]);
    setActiveViewportId(newId);
  };

  const handleRemoveViewport = () => {
    if (viewports.length <= 1) return;
    setViewports((prev) => {
      const newList = [...prev];
      newList.pop(); 
      return newList;
    });
    setActiveViewportId((prevId) => viewports[0].id);
  };

  const handleToolChange = (toolName: ToolMode) => setActiveTool(toolName);
  const triggerUpload = () => fileInputRef.current?.click();

  // --- NEW: Handle Preset Change ---
  const handlePresetChange = (preset: VoiPreset) => {
    // Update ONLY the active viewport's preset
    setViewports(prev => prev.map(vp => {
      if (vp.id === activeViewportId) {
        return { ...vp, preset: preset };
      }
      return vp;
    }));
  };

  return (
    <div className={styles.dicomViewPage}>
      <DicomTopBar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        isSyncActive={false}
        onAddViewport={handleAddViewport}
        onRemoveViewport={handleRemoveViewport}
        // --- Connect handler ---
        onPresetChange={handlePresetChange}
      />

      {/* Upload Button Section (Kept Same) */}
      <div style={{ position: "fixed", right: 20, top: 80, zIndex: 100 }}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".dcm"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button onClick={triggerUpload} style={{ /* ... styles ... */ display:'flex', gap:6, padding:'8px 16px', borderRadius:4, border:'none', background:'#2563eb', color:'white', cursor:'pointer' }}>
          <Upload size={16} />
          Upload ({activeViewportId})
        </button>
      </div>

      <div className={styles.viewportGrid} style={{ '--cols': viewports.length } as React.CSSProperties}>
        {viewports.map((vp, index) => (
          <div
            key={vp.id}
            onClick={() => setActiveViewportId(vp.id)}
            className={
              activeViewportId === vp.id ? styles.activeViewport : styles.inactiveViewport
            }
          >
            <DicomViewer
              viewportId={vp.id}
              imageIds={vp.imageIds}
              activeTool={activeTool}
              // --- Pass the preset down ---
              activePreset={vp.preset}
            />
            
            <span style={{ position: "absolute", top: 5, left: 5, color: "#3b82f6", fontSize: "12px", pointerEvents: "none", fontWeight: "bold", zIndex: 10 }}>
              Series {index + 1} {activeViewportId === vp.id && "●"}
              {/* Optional: Show active filter name */}
              {vp.preset && ` [${vp.preset.label}]`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DicomViewPage;