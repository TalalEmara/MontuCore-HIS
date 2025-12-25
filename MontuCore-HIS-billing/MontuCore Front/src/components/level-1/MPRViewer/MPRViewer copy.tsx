import React, { useEffect, useRef, useState } from 'react';
import {
  init as coreInit,
  RenderingEngine,
  Enums,
  volumeLoader,
  setVolumesForViewports,
  imageLoader,
  getRenderingEngine,
  type Types,
} from '@cornerstonejs/core';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import * as cornerstoneTools from '@cornerstonejs/tools';

// Imports from the NEW tools library (ensure you have v1.x+)
import { synchronizers } from '@cornerstonejs/tools';

const {
  ToolGroupManager,
  WindowLevelTool,
  ZoomTool,
  PanTool,
  StackScrollTool,
  CrosshairsTool,
  Enums: csToolsEnums,
} = cornerstoneTools;

const { createVOISynchronizer } = synchronizers;
const { ViewportType } = Enums;
const { MouseBindings } = csToolsEnums;

type VolumeViewerProps = {
  imageIds: string[];
};

const RENDERING_ENGINE_ID = 'myRenderingEngine';
const TOOL_GROUP_ID = 'myToolGroup';
const VOLUME_ID = 'myVolume';
const SYNC_ID_VOI = 'myVOISynchronizer';

const VIEWPORT_IDS = {
  AXIAL: 'CT_AXIAL',
  SAGITTAL: 'CT_SAGITTAL',
  CORONAL: 'CT_CORONAL',
};

export const VolumeViewer: React.FC<VolumeViewerProps> = ({ imageIds }) => {
  const axialRef = useRef<HTMLDivElement | null>(null);
  const sagittalRef = useRef<HTMLDivElement | null>(null);
  const coronalRef = useRef<HTMLDivElement | null>(null);
  
  const renderingEngineRef = useRef<RenderingEngine | null>(null);
  const toolGroupRef = useRef<any>(null); 
  // Store the synchronizer instance directly so we can destroy it later
  const voiSyncRef = useRef<any>(null);

  const [activeTool, setActiveTool] = useState<string>('WindowLevel');
  const [isCrosshairsOn, setIsCrosshairsOn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!imageIds || imageIds.length === 0) return;

      // 1. Init
      await coreInit();
      await dicomImageLoaderInit();
      await cornerstoneTools.init();

      if (cancelled) return;

      // 2. Register Tools
      const addToolSafe = (toolClass: any) => {
          try { cornerstoneTools.addTool(toolClass); } catch(e) {}
      };
      addToolSafe(WindowLevelTool);
      addToolSafe(ZoomTool);
      addToolSafe(PanTool);
      addToolSafe(StackScrollTool);
      addToolSafe(StackScrollTool);
      addToolSafe(CrosshairsTool);

      // 3. Load Images
      const loadPromises = imageIds.map((imageId) =>
        imageLoader.loadAndCacheImage(imageId)
      );
      await Promise.all(loadPromises);

      if (cancelled) return;

      // 4. Rendering Engine
      const renderingEngine = new RenderingEngine(RENDERING_ENGINE_ID);
      renderingEngineRef.current = renderingEngine;

      // 5. Viewports
      const viewportInput: Types.PublicViewportInput[] = [
        {
          viewportId: VIEWPORT_IDS.AXIAL,
          element: axialRef.current!,
          type: ViewportType.ORTHOGRAPHIC,
          defaultOptions: { orientation: Enums.OrientationAxis.AXIAL },
        },
        {
          viewportId: VIEWPORT_IDS.SAGITTAL,
          element: sagittalRef.current!,
          type: ViewportType.ORTHOGRAPHIC,
          defaultOptions: { orientation: Enums.OrientationAxis.SAGITTAL },
        },
        {
          viewportId: VIEWPORT_IDS.CORONAL,
          element: coronalRef.current!,
          type: ViewportType.ORTHOGRAPHIC,
          defaultOptions: { orientation: Enums.OrientationAxis.CORONAL },
        },
      ];

      renderingEngine.setViewports(viewportInput);

      // 6. ToolGroup
      let toolGroup = ToolGroupManager.getToolGroup(TOOL_GROUP_ID);
    //   if (toolGroup) toolGroup.destroy();
      
      toolGroup = ToolGroupManager.createToolGroup(TOOL_GROUP_ID);
      toolGroupRef.current = toolGroup;

      if (toolGroup) {
        toolGroup.addTool(WindowLevelTool.toolName);
        toolGroup.addTool(ZoomTool.toolName);
        toolGroup.addTool(PanTool.toolName);
        toolGroup.addTool(StackScrollTool.toolName);
        toolGroup.addTool(StackScrollTool.toolName);
        
        toolGroup.addTool(CrosshairsTool.toolName, {
            viewportIdentifiers: [VIEWPORT_IDS.AXIAL, VIEWPORT_IDS.SAGITTAL, VIEWPORT_IDS.CORONAL]
        });

        toolGroup.setToolActive(WindowLevelTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Primary }],
        });
        toolGroup.setToolActive(ZoomTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Secondary }],
        });
        toolGroup.setToolActive(StackScrollTool.toolName);

        toolGroup.addViewport(VIEWPORT_IDS.AXIAL, RENDERING_ENGINE_ID);
        toolGroup.addViewport(VIEWPORT_IDS.SAGITTAL, RENDERING_ENGINE_ID);
        toolGroup.addViewport(VIEWPORT_IDS.CORONAL, RENDERING_ENGINE_ID);
      }

      // 7. Synchronizers
      // FIX 1: Provide the empty options object `{}` as the second argument.
      // FIX 2: Store the returned instance in a ref.
      const voiSynchronizer = createVOISynchronizer(SYNC_ID_VOI, {
          syncInvertState: false,
          syncColormap: false
      });
      voiSyncRef.current = voiSynchronizer;
      
      [VIEWPORT_IDS.AXIAL, VIEWPORT_IDS.SAGITTAL, VIEWPORT_IDS.CORONAL].forEach((id) => {
          voiSynchronizer.add({ renderingEngineId: RENDERING_ENGINE_ID, viewportId: id });
      });

      // 8. Volume
      const volume = await volumeLoader.createAndCacheVolume(VOLUME_ID, { imageIds });
      await volume.load();

      await setVolumesForViewports(
        renderingEngine,
        [{ volumeId: VOLUME_ID }],
        [VIEWPORT_IDS.AXIAL, VIEWPORT_IDS.SAGITTAL, VIEWPORT_IDS.CORONAL]
      );

      renderingEngine.render();
    };

    run().catch(console.error);

    return () => {
      cancelled = true;
      if (toolGroupRef.current) toolGroupRef.current.destroy();
      
      // FIX 3: Destroy using the stored instance directly
      if (voiSyncRef.current) {
          voiSyncRef.current.destroy();
          voiSyncRef.current = null;
      }

      if (renderingEngineRef.current) renderingEngineRef.current.destroy();
    };
  }, [imageIds]);


  // --- Interactions ---

  const activateTool = (toolName: string) => {
    const toolGroup = ToolGroupManager.getToolGroup(TOOL_GROUP_ID);
    if (!toolGroup) return;

    const currentPrimary = toolGroup.getActivePrimaryMouseButtonTool();
    if (currentPrimary) toolGroup.setToolPassive(currentPrimary);

    toolGroup.setToolActive(toolName, {
      bindings: [{ mouseButton: MouseBindings.Primary }],
    });
    
    if (toolName !== CrosshairsTool.toolName) {
        toolGroup.setToolPassive(CrosshairsTool.toolName);
        setIsCrosshairsOn(false);
    } else {
        setIsCrosshairsOn(true);
    }
    setActiveTool(toolName);
  };

  const toggleCrosshairs = () => {
      if (isCrosshairsOn) {
          activateTool(WindowLevelTool.toolName);
      } else {
          activateTool(CrosshairsTool.toolName);
      }
  };

  const resetCamera = () => {
      const renderingEngine = getRenderingEngine(RENDERING_ENGINE_ID);
      if(!renderingEngine) return;
      renderingEngine.getViewports().forEach(vp => vp.resetCamera());
      renderingEngine.render();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      {/* Toolbar */}
      <div style={{ 
          padding: '10px', 
          background: '#1a1a1a', 
          display: 'flex', 
          gap: '8px', 
          borderRadius: '6px',
          alignItems: 'center',
          flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '5px' }}>
            <ToolbarButton 
                label="Contrast" 
                isActive={activeTool === WindowLevelTool.toolName} 
                onClick={() => activateTool(WindowLevelTool.toolName)} 
            />
            <ToolbarButton 
                label="Pan" 
                isActive={activeTool === PanTool.toolName} 
                onClick={() => activateTool(PanTool.toolName)} 
            />
            <ToolbarButton 
                label="Zoom" 
                isActive={activeTool === ZoomTool.toolName} 
                onClick={() => activateTool(ZoomTool.toolName)} 
            />
            <ToolbarButton 
                label="Scroll" 
                isActive={activeTool === StackScrollTool.toolName} 
                onClick={() => activateTool(StackScrollTool.toolName)} 
            />
        </div>

        <div style={{ width: '1px', height: '24px', background: '#444', margin: '0 5px'}}></div>

        <button 
            onClick={toggleCrosshairs}
            style={{ 
                background: isCrosshairsOn ? '#ff4d4d' : '#333', 
                color: 'white',
                fontWeight: '600',
                border: isCrosshairsOn ? '1px solid #ff4d4d' : '1px solid #555',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
            }}
        >
            {isCrosshairsOn ? 'Sync ON' : 'Enable Sync'}
        </button>

        <div style={{ flex: 1 }}></div>
        
        <button 
            onClick={resetCamera}
            style={{ 
                background: '#333', color: '#ccc', border: '1px solid #555', 
                padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' 
            }}
        >
            Reset
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
        <ViewportContainer title="Axial" refProp={axialRef} color="#ff4d4d" />
        <ViewportContainer title="Sagittal" refProp={sagittalRef} color="#ffff4d" />
        <ViewportContainer title="Coronal" refProp={coronalRef} color="#4dff4d" />
      </div>
    </div>
  );
};

// Sub-components
const ToolbarButton = ({ label, isActive, onClick }: any) => (
    <button 
        onClick={onClick}
        style={{ 
            background: isActive ? '#3b82f6' : '#333',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: isActive ? '600' : '400'
        }}
    >
        {label}
    </button>
);

const ViewportContainer = ({ title, refProp, color }: any) => (
    <div style={{ position: 'relative', height: '400px', width: '100%', overflow: 'hidden', background: 'black' }}>
        <div style={{ 
            position: 'absolute', 
            top: 8, 
            left: 8, 
            color: color, 
            zIndex: 10, 
            fontWeight: 'bold',
            fontSize: '14px',
            textShadow: '0 0 2px black'
        }}>
            {title}
        </div>
        <div
            ref={refProp}
            style={{ width: '100%', height: '100%' }}
            onContextMenu={(e) => e.preventDefault()}
        />
    </div>
);

export default VolumeViewer;