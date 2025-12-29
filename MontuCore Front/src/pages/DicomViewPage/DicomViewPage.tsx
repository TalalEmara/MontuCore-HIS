import React, { useState } from "react";
import DicomTopBar, {
  type ToolMode,
  type ViewMode,
} from "../../components/DicomView/DicomTopBar/DicomTopBar";
import DicomViewer, {
  type VoiPreset,
} from "../../components/level-1/DicomViewer/DicomViewer";

import styles from "./DicomViewPage.module.css";
import MPRViewer from "../../components/level-1/MPRViewer/MPRViewer";
import DicomViewer3D from "../../components/DicomViewer3D/DicomViewer3D"; // NEW IMPORT
import { useExamLoader } from "../../hooks/DicomViewer/useExamLoader";
import { DicomSidebar } from "../../components/DicomView/DicomSideBar/DicomSideBar";
import { useCDSS } from "../../hooks/DicomViewer/useCDSS";
import { useDicomFileHandler } from "../../hooks/DicomViewer/useDicomFileHandler";
import { usePatientExams } from "../../hooks/usePatientExam";
import { useParams } from "@tanstack/react-router";

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
  const [viewMode, setViewMode] = useState<ViewMode>("stack");

  const [viewports, setViewports] = useState<ViewportData[]>([
    { id: "viewport-0", imageIds: [], preset: null },
  ]);

  const [activeViewportId, setActiveViewportId] =
    useState<string>("viewport-0");

  const activeViewportData =
    viewports.find((vp) => vp.id === activeViewportId) || viewports[0];
  const hasImages =
    activeViewportData.imageIds && activeViewportData.imageIds.length > 0;

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
  const { handleFileChange: processLocalFiles } = useDicomFileHandler(handleNewDicomFiles);
  const { loadExam, isLoading , examMetadata} = useExamLoader(handleNewDicomFiles);
  const { analyzeImages, isAnalyzing, cdssResult } = useCDSS();
   const params = useParams({ strict: false });
  const loadedPatientId = Number(params.patientId || 0);
  const loadedCaseId = params.caseId ? Number(params.caseId) : null;

  // 3. Fetch History for this Patient (filtered by case if caseId provided)
  const { data: patientHistory = [] } = usePatientExams(loadedPatientId, loadedCaseId);
  
  const modality = examMetadata?.modality || "Unknown Modality";
  const bodyPart = examMetadata?.bodyPart || "Unknown Body Part";
  const dateStr = examMetadata?.performedAt 
    ? new Date(examMetadata.performedAt).toLocaleString() 
    : "";
    const patientName = examMetadata?.medicalCase?.athlete?.fullName || "No Patient Loaded";
  const patientId = examMetadata?.medicalCase?.athlete?.id || "--";
  const radiologistNotes = examMetadata?.radiologistNotes || null;

  const viewerTitle = `${bodyPart} - ${modality} ${dateStr}`;
  // --- ACTIONS ---
  const handleRunAI = () => {
    // Assuming you have access to currentImageIds from your viewports state
    if (activeViewportData.imageIds.length > 0) {
      analyzeImages(activeViewportData.imageIds, 13, 101); // arguments passed separately
    }
  };
  const handleAddViewport = () => {
    if (viewports.length === 12) return;
    const newId = `viewport-${Date.now()}`;
    setViewports((prev) => [
      ...prev,
      { id: newId, imageIds: [], preset: null },
    ]);
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
    setViewports((prev) =>
      prev.map((vp) => {
        if (vp.id === activeViewportId) return { ...vp, preset: preset };
        return vp;
      })
    );
  };
const onLocalUpload = (files: FileList) => {
    const mockEvent = { target: { files } } as React.ChangeEvent<HTMLInputElement>;
    processLocalFiles(mockEvent);
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

     

      <div className={styles.viewContainer}>
        <DicomSidebar
          onAnalyzeClick={handleRunAI}
          isAnalyzing={isAnalyzing}
          cdssResult={cdssResult}
          exams={patientHistory}
         onExamClick={(examID) => {
            console.log("Switching to exam ID:", examID);
            loadExam(examID); // Load the clicked exam
          }}
        patientId={patientId}
          patientName={patientName}
          caseId={loadedCaseId}
          radiologistNotes={radiologistNotes}
          onLocalUpload={onLocalUpload}
        />
        {/* RENDER AREA */}
        {viewMode === "stack" && (
          // --- 2D STACK VIEW ---
          <div
            className={styles.viewportGrid}
            style={{ "--cols": viewports.length } as React.CSSProperties}
          >
            {viewports.map((vp) => (
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
                  title={viewerTitle}
                  viewportId={vp.id}
                  imageIds={vp.imageIds}
                  activeTool={activeTool}
                  activePreset={vp.preset}
                />
              </div>
            ))}
          </div>
        )}

        {viewMode === "mpr" && (
          // --- MPR ORTHO VIEW ---
          <div
            style={{
              width: "100%",
              height: "calc(100vh - 60px)",
              padding: "10px",
            }}
          >
            {hasImages ? (
              <MPRViewer
                key={`mpr-view-${activeViewportId}`}
                imageIds={activeViewportData.imageIds}
                activeTool={activeTool}
              />
            ) : (
              <div style={{ color: "white", padding: 20 }}>
                No images loaded to generate MPR.
              </div>
            )}
          </div>
        )}

        {viewMode === "3d" && (
          // --- 3D VOLUME VIEW ---
          <div
            style={{
              width: "100%",
              height: "calc(100vh - 60px)",
              padding: "10px",
            }}
          >
            {hasImages ? (
              <DicomViewer3D imageIds={activeViewportData.imageIds} />
            ) : (
              <div style={{ color: "white", padding: 20 }}>
                No images loaded for 3D Volume.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

DicomViewPage.displayName = "DicomViewPage";

export default DicomViewPage;
