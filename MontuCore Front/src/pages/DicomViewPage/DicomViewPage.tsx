import React, { useState, useEffect, useRef } from "react";
import DicomTopBar, {
  type ToolMode,
} from "../../components/DicomView/DicomTopBar/DicomTopBar";
import DicomViewer from "../../components/level-1/DicomViewer/DicomViewer";
import { useDicomFileHandler } from "../../hooks/DicomViewer/useDicomFileHandler";
import { Upload } from "lucide-react";
import styles from "./DicomViewPage.module.css";

// 1. Define the shape of a viewport
interface ViewportData {
  id: string;
  imageIds: string[];
}

function DicomViewPage() {
  // --- STATE ---
  const [activeTool, setActiveTool] = useState<ToolMode>("WindowLevel");

  // 2. Dynamic Viewports State (Array instead of Object)
  const [viewports, setViewports] = useState<ViewportData[]>([
    { id: "viewport-0", imageIds: [] }, // Start with 1 viewport
  ]);

  const [activeViewportId, setActiveViewportId] = useState<string>("viewport-0");

  // --- HANDLER: File Upload ---
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

  // --- DYNAMIC VIEWPORT ACTIONS ---
  const handleAddViewport = () => {
    if(viewports.length==12) return
    const newId = `viewport-${Date.now()}`;
    setViewports((prev) => [...prev, { id: newId, imageIds: [] }]);
   
    setActiveViewportId(newId);
  };

  const handleRemoveViewport = () => {
    if (viewports.length <= 1) return; // Prevent removing the last one

    setViewports((prev) => {
      const newList = [...prev];
      newList.pop(); 
      return newList;
    });

    // Safety: If active viewport was deleted, reset to the first one
    setActiveViewportId((prevId) => {
        
        return viewports[0].id; 
    });
  };

  // --- TOP BAR HANDLERS ---
  const handleToolChange = (toolName: ToolMode) => setActiveTool(toolName);


  const triggerUpload = () => fileInputRef.current?.click();

 
  return (
    <div className={styles.dicomViewPage}>
      {/* 1. TOP BAR */}
      <DicomTopBar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        isSyncActive={false}
    
        onAddViewport={handleAddViewport}

        onRemoveViewport={handleRemoveViewport}
      
      />

      {/* 2. UPLOAD SECTION (Hidden Input + Button) */}
      <div style={{ position: "fixed", right: 20, top: 80, zIndex: 100 }}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".dcm"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          onClick={triggerUpload}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          <Upload size={16} />
          Upload to Selected ({activeViewportId})
        </button>
      </div>

      {/* 3. VIEWPORT GRID */}
      <div className={styles.viewportGrid}>
        
        {viewports.map((vp, index) => (
          <div
            key={vp.id}
            onClick={() => setActiveViewportId(vp.id)}
            className={
              activeViewportId === vp.id
                ? styles.activeViewport
                : styles.inactiveViewport
            }
          >
            <DicomViewer
              viewportId={vp.id}
              imageIds={vp.imageIds}
              activeTool={activeTool}
            />
            
            {/* Overlay Label */}
            <span
              style={{
                position: "absolute",
                top: 5,
                left: 5,
                color: "#3b82f6",
                fontSize: "12px",
                pointerEvents: "none",
                fontWeight: "bold",
                zIndex: 10,
              }}
            >
              Series {index + 1} {activeViewportId === vp.id && "●"}
            </span>
          </div>
        ))}

      </div>
    </div>
  );
}

export default DicomViewPage;