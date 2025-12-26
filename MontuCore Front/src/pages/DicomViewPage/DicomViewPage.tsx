import React, { useState, useRef, useEffect } from "react";
import { useSearch, useParams } from "@tanstack/react-router";
import DicomTopBar, { type ToolMode } from "../../components/DicomView/DicomTopBar/DicomTopBar";
import DicomViewer, { type VoiPreset } from "../../components/level-1/DicomViewer/DicomViewer";
import { useDicomFileHandler } from "../../hooks/DicomViewer/useDicomFileHandler";
import { useDicomUrlHandler } from "../../hooks/DicomViewer/useDicomUrlHandler";
import { Upload, Box, Grid3X3 } from "lucide-react";
import styles from "./DicomViewPage.module.css";
import MPRViewer from "../../components/level-1/MPRViewer/MPRViewer";
import { useDicomURL } from "../../hooks/DicomViewer/useDicomURL";

interface ViewportData {
  id: string;
  imageIds: string[];
  preset?: VoiPreset | null;
}

interface DicomViewPageRef {
  loadDicomFromUrls: (urls: string[]) => void;
}

const DicomViewPage = React.forwardRef<DicomViewPageRef>((props, ref) => {
  const [activeTool, setActiveTool] = useState<ToolMode>("WindowLevel");
  const [isMPR, setIsMPR] = useState<boolean>(false);
  
  // Get route parameters
  const routeParams = useParams({ from: '/dicom/$examId' }) as { examId?: string };
  const examId = routeParams?.examId;
  const searchParams = useSearch({ from: '/dicom/$examId' }) as { url?: string };
  
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

  const { handleFileChange } = useDicomFileHandler(handleNewDicomFiles);
  const { handleUrls } = useDicomUrlHandler(handleNewDicomFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadedRef = useRef(false);

  // Expose function to load DICOM from URLs (can be called from parent components)
  React.useImperativeHandle(ref, () => ({
    loadDicomFromUrls: (urls: string[]) => {
      handleUrls(urls);
    }
  }));

  // Check for URL/route parameters on mount
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const loadDicom = async () => {
      // Check route parameter first (higher priority)
      if (examId) {
        console.log('Loading DICOM for exam ID from route:', examId);
        try {
          const response = await fetch(`http://localhost:3000/api/exams/${examId}`);
          const examData = await response.json();
          console.log('Exam data received:', examData);
          console.log('Exam data.data:', examData.data);
          if (examData.data && examData.data.dicomPublicUrl) {
            console.log('Found DICOM URL for exam:', examData.data.dicomPublicUrl);
            await handleUrls([examData.data.dicomPublicUrl]);
          } else {
            console.warn('Exam does not have a DICOM file. Available fields:', Object.keys(examData.data || examData));
            // Fallback to URL parameter if exam doesn't have DICOM
            if (searchParams.url) {
              console.log('Using URL parameter as fallback:', searchParams.url);
              await handleUrls([searchParams.url]);
            } else {
              console.warn('No DICOM URL available for exam', examId);
            }
          }
        } catch (error) {
          console.error('Error fetching exam data:', error);
        }
      }
      // Check search parameter as fallback
      else if (searchParams.url) {
        console.log('Loading DICOM from URL parameter:', searchParams.url);
        await handleUrls([searchParams.url]);
      }
      // Fallback to hardcoded exam ID 16 for demo
      else {
        console.log('No parameters provided, loading demo exam ID 16');
        try {
          const response = await fetch(`http://localhost:3000/api/exams/16`);
          const examData = await response.json();
          console.log('Demo exam data received:', examData);
          if (examData.data && examData.data.dicomPublicUrl) {
            console.log('Found DICOM URL for demo exam 16:', examData.data.dicomPublicUrl);
            await handleUrls([examData.data.dicomPublicUrl]);
          } else {
            console.warn('Demo exam 16 does not have a DICOM file, trying local file');
            // Try loading local DICOM file for testing
            const localUrl = 'http://localhost:5173/dicom_images/demo_pure_acl_6.dcm';
            console.log('Trying local DICOM file:', localUrl);
            await handleUrls([localUrl]);
          }
        } catch (error) {
          console.error('Error fetching demo exam data:', error);
        }
      }
    };

    loadDicom();
  }, [examId, searchParams.url, handleUrls]);

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
});

DicomViewPage.displayName = 'DicomViewPage';

export default DicomViewPage;