import React, { useState, useRef } from "react";
import DicomTopBar, { type ToolMode } from "../../components/DicomView/DicomTopBar/DicomTopBar";
import DicomViewer, { type VoiPreset } from "../../components/level-1/DicomViewer/DicomViewer"; 
import { useDicomFileHandler } from "../../hooks/DicomViewer/useDicomFileHandler";
import { Upload, Box, Grid3X3 } from "lucide-react"; 
import styles from "./DicomViewPage.module.css";
import MPRViewer from "../../components/level-1/MPRViewer/MPRViewer";
import { useDicomURL } from "../../hooks/DicomViewer/useDicomURL";

interface ViewportData {
  id: string;
  imageIds: string[];
  preset?: VoiPreset | null;
}

function DicomViewPage() {
  const [activeTool, setActiveTool] = useState<ToolMode>("WindowLevel");
  const [isMPR, setIsMPR] = useState<boolean>(false);
  
  const [viewports, setViewports] = useState<ViewportData[]>([
    { id: "viewport-0", imageIds: [], preset: null },
  ]);

  const [activeViewportId, setActiveViewportId] = useState<string>("viewport-0");

  const activeViewportData = viewports.find(vp => vp.id === activeViewportId) || viewports[0];
  
  const hasImages = activeViewportData.imageIds && activeViewportData.imageIds.length > 0;

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

  // const { handleFileChange } = useDicomFileHandler(handleNewDicomFiles);
  const { fetchDicomUrl } = useDicomURL(handleNewDicomFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ACTIONS ---
  const handleAddViewport = () => {
    if (viewports.length === 12) return;
    const newId = `viewport-${Date.now()}`;
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

  // --- Handle Preset Change ---
  const handlePresetChange = (preset: VoiPreset) => {
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
        onPresetChange={handlePresetChange}
        onViewSwitch={()=>setIsMPR(!isMPR)}
      />

      {/* Floating Controls: Upload & MPR Toggle */}
      <div style={{ position: "fixed", right: 20, top: 80, zIndex: 100, display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
        {/* <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".dcm"
          onChange={handleFileChange}
          style={{ display: "none" }}
        /> */}
        
        {/* Upload Button */}
        <button 
            onClick={() => fetchDicomUrl(16)} 
            style={{ display: 'flex', gap: 6, padding: '8px 16px', borderRadius: 4, border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', alignItems: 'center' }}
        >
          <Upload size={16} />
          Upload 14 ({activeViewportId})
        </button>

        
      </div>

      {/* RENDER AREA */}
      {!isMPR ? (
        // STACK VIEW (2D)
        <div className={styles.viewportGrid} style={{ '--cols': viewports.length } as React.CSSProperties}>
          {viewports.map((vp, index) => (
            <div
              key={vp.id}
              onClick={() => setActiveViewportId(vp.id)}
              className={activeViewportId === vp.id ? styles.activeViewport : styles.inactiveViewport}
            >
              <DicomViewer
                viewportId={vp.id}
                imageIds={vp.imageIds}
                activeTool={activeTool}
                activePreset={vp.preset}
              />
              
            </div>
          ))}
        </div>
      ) : (
        // MPR VIEW (3D)
        <div style={{ width: '100%', height: 'calc(100vh - 60px)', padding: '10px' }}>
             {/* CHECK IF WE HAVE IMAGES BEFORE RENDERING MPR */}
             {hasImages ? (
                 <MPRViewer
                    imageIds={activeViewportData.imageIds}
                    activeTool={activeTool}
                 />

                //   <DicomViewer3D
                //     imageIds={activeViewportData.imageIds}
                //     // activeTool={activeTool}
                //  />
             ) : <></>}
        </div>
      )}
    </div>
  );
}

export default DicomViewPage;