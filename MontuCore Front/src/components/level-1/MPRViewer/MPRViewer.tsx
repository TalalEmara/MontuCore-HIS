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
  TrackballRotateTool,
  Enums: csToolsEnums,
} = cornerstoneTools;

const { createVOISynchronizer } = synchronizers;
const { ViewportType } = Enums;
const { MouseBindings } = csToolsEnums;

type MPRViewerProps = {
  imageIds: string[];
  activeTool: string;
};

// CONSTANTS
const RENDERING_ENGINE_ID = 'myRenderingEngine';
const TOOL_GROUP_MPR = 'GROUP_MPR'; // 2D Group
const TOOL_GROUP_3D = 'GROUP_3D';   // 3D Group
const VOLUME_ID = 'myVolume';
const SYNC_ID_VOI = 'myVOISynchronizer';

const VIEWPORT_IDS = {
  AXIAL: 'AXIAL',
  SAGITTAL: 'SAGITTAL',
  CORONAL: 'CORONAL',
  VOLUME_3D: 'VOLUME_3D',
};

export const MPRViewer: React.FC<MPRViewerProps> = ({ imageIds, activeTool }) => {
  const axialRef = useRef<HTMLDivElement | null>(null);
  const sagittalRef = useRef<HTMLDivElement | null>(null);
  const coronalRef = useRef<HTMLDivElement | null>(null);
  const ref3d = useRef<HTMLDivElement | null>(null);
  
  const renderingEngineRef = useRef<RenderingEngine | null>(null);
  const voiSyncRef = useRef<any>(null);

  // --- Effect 1: Initialization ---
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!imageIds || imageIds.length === 0) return;

      // 1. Init Libraries
      try {
        await coreInit();
        await dicomImageLoaderInit();
        await cornerstoneTools.init();
      } catch (e) {
        // Ignore if already initialized
      }

      if (cancelled) return;

      // 2. Register Tools
      const addToolSafe = (toolClass: any) => {
          try { cornerstoneTools.addTool(toolClass); } catch(e) {}
      };
      addToolSafe(WindowLevelTool);
      addToolSafe(ZoomTool);
      addToolSafe(PanTool);
      addToolSafe(StackScrollTool);
      addToolSafe(CrosshairsTool);
      addToolSafe(TrackballRotateTool);

      // 3. Load Images
      const loadPromises = imageIds.map((imageId) =>
        imageLoader.loadAndCacheImage(imageId)
      );
      await Promise.all(loadPromises);

      if (cancelled) return;

      
      const existingEngine = getRenderingEngine(RENDERING_ENGINE_ID);
      if (existingEngine) existingEngine.destroy();

      // Destroy ToolGroups
      try { ToolGroupManager.destroyToolGroup(TOOL_GROUP_MPR); } catch(e){}
      try { ToolGroupManager.destroyToolGroup(TOOL_GROUP_3D); } catch(e){}
      
      // 5. Create Engine & Viewports
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
        {
          viewportId: VIEWPORT_IDS.VOLUME_3D,
          element: ref3d.current!,
          type: ViewportType.VOLUME_3D,
          defaultOptions: { orientation: Enums.OrientationAxis.ACQUISITION },
        },
      ];

      renderingEngine.setViewports(viewportInput);

      // 6. Define Tool Groups
      
      // --- Group A: MPR (2D) ---
      const mprGroup = ToolGroupManager.createToolGroup(TOOL_GROUP_MPR);
      if (mprGroup) {
          mprGroup.addTool(WindowLevelTool.toolName);
          mprGroup.addTool(ZoomTool.toolName);
          mprGroup.addTool(PanTool.toolName);
          mprGroup.addTool(StackScrollTool.toolName);
          mprGroup.addTool(CrosshairsTool.toolName, {
            viewportIdentifiers: [VIEWPORT_IDS.AXIAL, VIEWPORT_IDS.SAGITTAL, VIEWPORT_IDS.CORONAL]
          });

          // Defaults
          mprGroup.setToolActive(WindowLevelTool.toolName, { bindings: [{ mouseButton: MouseBindings.Primary }] });
          mprGroup.setToolActive(ZoomTool.toolName, { bindings: [{ mouseButton: MouseBindings.Secondary }] });
          mprGroup.setToolActive(StackScrollTool.toolName, { bindings: [{ mouseButton: MouseBindings.Wheel }] });

          mprGroup.addViewport(VIEWPORT_IDS.AXIAL, RENDERING_ENGINE_ID);
          mprGroup.addViewport(VIEWPORT_IDS.SAGITTAL, RENDERING_ENGINE_ID);
          mprGroup.addViewport(VIEWPORT_IDS.CORONAL, RENDERING_ENGINE_ID);
      }

      // --- Group B: 3D ---
      const vol3dGroup = ToolGroupManager.createToolGroup(TOOL_GROUP_3D);
      if (vol3dGroup) {
          vol3dGroup.addTool(TrackballRotateTool.toolName);
          vol3dGroup.addTool(ZoomTool.toolName);

          // 3D Defaults: Rotate (Left), Zoom (Right)
          vol3dGroup.setToolActive(TrackballRotateTool.toolName, { bindings: [{ mouseButton: MouseBindings.Primary }] });
          vol3dGroup.setToolActive(ZoomTool.toolName, { bindings: [{ mouseButton: MouseBindings.Secondary }] });

          vol3dGroup.addViewport(VIEWPORT_IDS.VOLUME_3D, RENDERING_ENGINE_ID);
      }

      // 7. Synchronizers
      // We wrap this in try/catch just in case, but we don't check "getSynchronizer" anymore.
      try {
          const voiSynchronizer = createVOISynchronizer(SYNC_ID_VOI, {
              syncInvertState: false,
              syncColormap: false
          });
          voiSyncRef.current = voiSynchronizer;
          
          [VIEWPORT_IDS.AXIAL, VIEWPORT_IDS.SAGITTAL, VIEWPORT_IDS.CORONAL].forEach((id) => {
              voiSynchronizer.add({ renderingEngineId: RENDERING_ENGINE_ID, viewportId: id });
          });
      } catch (err) {
          // If it fails (e.g., exists), we just continue.
      }

      // 8. Load Volume
      const volume = await volumeLoader.createAndCacheVolume(VOLUME_ID, { imageIds });
      await volume.load();

      await setVolumesForViewports(
        renderingEngine,
        [{ volumeId: VOLUME_ID }],
        [VIEWPORT_IDS.AXIAL, VIEWPORT_IDS.SAGITTAL, VIEWPORT_IDS.CORONAL, VIEWPORT_IDS.VOLUME_3D]
      );

      // 9. Fix 3D Appearance (Prevent "One Color Square")
      const viewport3D = renderingEngine.getViewport(VIEWPORT_IDS.VOLUME_3D);
      if (viewport3D) {
         // Apply a default CT Bone preset so it's visible
         viewport3D.setProperties({ preset: 'CT-Bone' });
      }

      renderingEngine.render();
    };

    run().catch(console.error);

    // --- Cleanup ---
    return () => {
      cancelled = true;
      try { ToolGroupManager.destroyToolGroup(TOOL_GROUP_MPR); } catch(e){}
      try { ToolGroupManager.destroyToolGroup(TOOL_GROUP_3D); } catch(e){}
      
      if (voiSyncRef.current) {
          try { voiSyncRef.current.destroy(); } catch(e){}
      }
      
      if (renderingEngineRef.current) {
          try { renderingEngineRef.current.destroy(); } catch(e){}
      }
    };
  }, [imageIds]);

  // --- Effect 2: Tool Switching ---
  useEffect(() => {
    // 1. Update MPR Group
    const mprGroup = ToolGroupManager.getToolGroup(TOOL_GROUP_MPR);
    if (mprGroup) {
        const currentPrimary = mprGroup.getActivePrimaryMouseButtonTool();
        if (currentPrimary) mprGroup.setToolPassive(currentPrimary);

        if (activeTool === CrosshairsTool.toolName) {
            mprGroup.setToolActive(CrosshairsTool.toolName, {
                bindings: [{ mouseButton: MouseBindings.Primary }],
            });
        } else if (activeTool !== 'Rotate') {
             // If standard tool, check if it exists in group
             if (mprGroup.getToolOptions(activeTool)) {
                 mprGroup.setToolActive(activeTool, {
                    bindings: [{ mouseButton: MouseBindings.Primary }],
                 });
             }
        }
    }

    // 2. Update 3D Group (Keep it simple)
    const vol3dGroup = ToolGroupManager.getToolGroup(TOOL_GROUP_3D);
    if (vol3dGroup) {
        // If user selects "Pan" or "Zoom", we can allow it in 3D too
        if (activeTool === 'Zoom') {
             vol3dGroup.setToolActive(ZoomTool.toolName, { bindings: [{ mouseButton: MouseBindings.Primary }] });
        } else {
             // Otherwise, force Rotate for 3D
             vol3dGroup.setToolActive(TrackballRotateTool.toolName, { bindings: [{ mouseButton: MouseBindings.Primary }] });
        }
    }
    
    const renderingEngine = getRenderingEngine(RENDERING_ENGINE_ID);
    if(renderingEngine) renderingEngine.render();

  }, [activeTool]); 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
      <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gridTemplateRows: '1fr 1fr', 
          gap: '4px', 
          height: '100%' 
      }}>
        <ViewportContainer title="Axial" refProp={axialRef} color="#c91633" />
        <ViewportContainer title="Sagittal" refProp={sagittalRef} color="#ffae00" />
        <ViewportContainer title="Coronal" refProp={coronalRef} color="#5FDD9D" />
        <ViewportContainer title="3D Volume" refProp={ref3d} color="#3b82f6" />
      </div>
    </div>
  );
};

// Sub-components
const ViewportContainer = ({ title, refProp, color }: any) => (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '300px', overflow: 'hidden', background: 'black' }}>
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