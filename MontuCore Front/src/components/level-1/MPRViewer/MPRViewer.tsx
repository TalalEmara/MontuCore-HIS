import React, { useEffect, useRef } from 'react';
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

// 1. Add activeTool to props
type MPRViewerProps = {
  imageIds: string[];
  activeTool: string;
};

const RENDERING_ENGINE_ID = 'myRenderingEngine';
const TOOL_GROUP_ID = 'myToolGroup';
const VOLUME_ID = 'myVolume';
const SYNC_ID_VOI = 'myVOISynchronizer';

const VIEWPORT_IDS = {
  AXIAL: 'AXIAL',
  SAGITTAL: 'SAGITTAL',
  CORONAL: 'ORONAL',
};

export const MPRViewer: React.FC<MPRViewerProps> = ({ imageIds, activeTool }) => {
  const axialRef = useRef<HTMLDivElement | null>(null);
  const sagittalRef = useRef<HTMLDivElement | null>(null);
  const coronalRef = useRef<HTMLDivElement | null>(null);
  
  const renderingEngineRef = useRef<RenderingEngine | null>(null);
  const toolGroupRef = useRef<any>(null); 
  const voiSyncRef = useRef<any>(null);

  
  // --- Effect 1: Initialization ---
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!imageIds || imageIds.length === 0) return;

      await coreInit();
      await dicomImageLoaderInit();
      await cornerstoneTools.init();

      if (cancelled) return;

      const addToolSafe = (toolClass: any) => {
          try { cornerstoneTools.addTool(toolClass); } catch(e) {}
      };
      addToolSafe(WindowLevelTool);
      addToolSafe(ZoomTool);
      addToolSafe(PanTool);
      addToolSafe(StackScrollTool);
      addToolSafe(CrosshairsTool);

      const loadPromises = imageIds.map((imageId) =>
        imageLoader.loadAndCacheImage(imageId)
      );
      await Promise.all(loadPromises);

      if (cancelled) return;

      const renderingEngine = new RenderingEngine(RENDERING_ENGINE_ID);
      renderingEngineRef.current = renderingEngine;

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

      let toolGroup = ToolGroupManager.getToolGroup(TOOL_GROUP_ID);
      // if (toolGroup) toolGroup.destroy();
      toolGroup = ToolGroupManager.createToolGroup(TOOL_GROUP_ID);
      toolGroupRef.current = toolGroup;

      if (toolGroup) {
        toolGroup.addTool(WindowLevelTool.toolName);
        toolGroup.addTool(ZoomTool.toolName);
        toolGroup.addTool(PanTool.toolName);
        toolGroup.addTool(StackScrollTool.toolName);
        
        toolGroup.addTool(CrosshairsTool.toolName, {
            viewportIdentifiers: [VIEWPORT_IDS.AXIAL, VIEWPORT_IDS.SAGITTAL, VIEWPORT_IDS.CORONAL]
        });

        // Activate default tool initially
        toolGroup.setToolActive(WindowLevelTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Primary }],
        });
        toolGroup.setToolActive(ZoomTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Secondary }],
        });
        toolGroup.setToolActive(StackScrollTool.toolName, {
             bindings: [{ mouseButton: MouseBindings.Wheel }]
        });

        toolGroup.addViewport(VIEWPORT_IDS.AXIAL, RENDERING_ENGINE_ID);
        toolGroup.addViewport(VIEWPORT_IDS.SAGITTAL, RENDERING_ENGINE_ID);
        toolGroup.addViewport(VIEWPORT_IDS.CORONAL, RENDERING_ENGINE_ID);
      }

      const voiSynchronizer = createVOISynchronizer(SYNC_ID_VOI, {
          syncInvertState: false,
          syncColormap: false
      });
      voiSyncRef.current = voiSynchronizer;
      
      [VIEWPORT_IDS.AXIAL, VIEWPORT_IDS.SAGITTAL, VIEWPORT_IDS.CORONAL].forEach((id) => {
          voiSynchronizer.add({ renderingEngineId: RENDERING_ENGINE_ID, viewportId: id });
      });

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
      if (voiSyncRef.current) {
          voiSyncRef.current.destroy();
          voiSyncRef.current = null;
      }
      if (renderingEngineRef.current) renderingEngineRef.current.destroy();
    };
  }, [imageIds]);

  // --- Effect 2: Update Tools when Top Bar prop changes ---
  useEffect(() => {
    const toolGroup = ToolGroupManager.getToolGroup(TOOL_GROUP_ID);
    if (!toolGroup) return;

    const currentPrimary = toolGroup.getActivePrimaryMouseButtonTool();
    if (currentPrimary) toolGroup.setToolPassive(currentPrimary);

    // If the top bar sends "Crosshairs", activate that, otherwise standard tools
    if (activeTool === CrosshairsTool.toolName) {
         toolGroup.setToolActive(CrosshairsTool.toolName, {
            bindings: [{ mouseButton: MouseBindings.Primary }],
         });
    } else {
        toolGroup.setToolPassive(CrosshairsTool.toolName);
        toolGroup.setToolActive(activeTool, {
            bindings: [{ mouseButton: MouseBindings.Primary }],
        });
    }
    
    const renderingEngine = getRenderingEngine(RENDERING_ENGINE_ID);
    if(renderingEngine) renderingEngine.render();

  }, [activeTool]); 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
        <ViewportContainer title="Axial" refProp={axialRef} color="#c91633" />
        <ViewportContainer title="Sagittal" refProp={sagittalRef} color="#ffae00" />
        <ViewportContainer title="Coronal" refProp={coronalRef} color="#5FDD9D" />
      </div>
    </div>
  );
};

// Sub-components
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

export default MPRViewer;