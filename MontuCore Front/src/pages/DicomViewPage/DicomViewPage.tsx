import React, { useState } from "react";
import DicomTopBar, { type ToolMode, type ViewMode } from "../../components/DicomView/DicomTopBar/DicomTopBar";
import DicomViewer, { type VoiPreset } from "../../components/level-1/DicomViewer/DicomViewer";
import { Download } from "lucide-react";
import styles from "./DicomViewPage.module.css";
import MPRViewer from "../../components/level-1/MPRViewer/MPRViewer";
import DicomViewer3D from "../../components/DicomViewer3D/DicomViewer3D"; // NEW IMPORT
import { useExamLoader } from "../../hooks/DicomViewer/useExamLoader";
import { DicomSidebar } from "../../components/DicomView/DicomSideBar/DicomSideBar";

interface ViewportData {
  id: string;
  imageIds: string[];
  preset?: VoiPreset | null;
}

interface DicomViewPageRef {
  loadDicomFromUrls: (urls: string[]) => void;
}

const DicomViewPage = React.forwardRef<DicomViewPageRef, {}>((props, ref) => {
  const [activeTool, setActiveTool] = useState<ToolMode>("WindowLevel");
  
  // CHANGED: From boolean isMPR to string viewMode
  const [viewMode, setViewMode] = useState<ViewMode>('stack');

  const [viewports, setViewports] = useState<ViewportData[]>([
    { id: "viewport-0", imageIds: [], preset: null },
  ]);

  const [activeViewportId, setActiveViewportId] = useState<string>("viewport-0");

  const activeViewportData = viewports.find(vp => vp.id === activeViewportId) || viewports[0];
  const hasImages = activeViewportData.imageIds && activeViewportData.imageIds.length > 0;

  // --- CALLBACK: Handle new images ---
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

  // --- HOOK: Passive Loader (No ID passed here) ---
  const { loadExam, isLoading } = useExamLoader(handleNewDicomFiles);

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
  
  const handlePresetChange = (preset: VoiPreset) => {
    setViewports(prev => prev.map(vp => {
      if (vp.id === activeViewportId) return { ...vp, preset: preset };
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
        // UPDATED PROPS
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div style={{ position: "fixed", right: 20, top: 80, zIndex: 100 }}>
        {/* BUTTON: Manually triggers load with ID 16 */}
        <button 
            onClick={() => loadExam(13)} 
            disabled={isLoading}
            style={{ display: 'flex', gap: 6, padding: '8px 16px', borderRadius: 4, border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', alignItems: 'center' }}
        >
          <Download size={16} />
          {isLoading ? 'Loading...' : `Load Exam 16`}
        </button>
      </div>

      <div className={styles.viewContainer}>
      <DicomSidebar patientId={""} patientName={""} onExamClick={function (examId: number): void {
          throw new Error("Function not implemented.");
        } }/>
      {/* RENDER AREA */}
      {viewMode === 'stack' && (
        // --- 2D STACK VIEW ---
        <div className={styles.viewportGrid} style={{ '--cols': viewports.length } as React.CSSProperties}>
          {viewports.map((vp) => (
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
      )}

      {viewMode === 'mpr' && (
        // --- MPR ORTHO VIEW ---
        <div style={{ width: '100%', height: 'calc(100vh - 60px)', padding: '10px' }}>
             {hasImages ? (
                 <MPRViewer
                    key={`mpr-view-${activeViewportId}`} 
                    imageIds={activeViewportData.imageIds}
                    activeTool={activeTool}
                 />
             ) : (
                <div style={{color:'white', padding: 20}}>No images loaded to generate MPR.</div>
             )}
        </div>
      )}

      {viewMode === '3d' && (
        // --- 3D VOLUME VIEW ---
        <div style={{ width: '100%', height: 'calc(100vh - 60px)', padding: '10px' }}>
             {hasImages ? (
                 <DicomViewer3D
                    imageIds={activeViewportData.imageIds}
                 />
             ) : (
                <div style={{color:'white', padding: 20}}>No images loaded for 3D Volume.</div>
             )}
        </div>
      )}
    </div>
    </div>
  );
});

DicomViewPage.displayName = 'DicomViewPage';

export default DicomViewPage;