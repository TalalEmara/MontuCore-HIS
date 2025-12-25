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

const {
  ToolGroupManager,
  ZoomTool,
  PanTool,
  TrackballRotateTool,
  Enums: csToolsEnums,
} = cornerstoneTools;

const { ViewportType } = Enums;
const { MouseBindings } = csToolsEnums;

type ViewerProps = {
  imageIds: string[];
};

// CONSTANTS
const RENDERING_ENGINE_ID = 'renderEngine3D';
const TOOL_GROUP_ID = 'GROUP_3D_ONLY';
const VOLUME_ID = 'myVolume3D';
const VIEWPORT_ID_3D = 'VIEWPORT_3D';

export const DicomViewer3D: React.FC<ViewerProps> = ({ imageIds }) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const renderingEngineRef = useRef<RenderingEngine | null>(null);

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
        // Already initialized
      }

      if (cancelled) return;

      // 2. Register Tools (Only 3D relevant tools)
      const addToolSafe = (toolClass: any) => {
          try { cornerstoneTools.addTool(toolClass); } catch(e) {}
      };
      addToolSafe(TrackballRotateTool);
      addToolSafe(ZoomTool);
      addToolSafe(PanTool);

      // 3. Load Images
      const loadPromises = imageIds.map((imageId) =>
        imageLoader.loadAndCacheImage(imageId)
      );
      await Promise.all(loadPromises);

      if (cancelled) return;

      // 4. Clean up old state
      const existingEngine = getRenderingEngine(RENDERING_ENGINE_ID);
      if (existingEngine) existingEngine.destroy();

      try { ToolGroupManager.destroyToolGroup(TOOL_GROUP_ID); } catch(e){}
      
      // 5. Create Engine & Viewport
      const renderingEngine = new RenderingEngine(RENDERING_ENGINE_ID);
      renderingEngineRef.current = renderingEngine;

      const viewportInput: Types.PublicViewportInput = {
        viewportId: VIEWPORT_ID_3D,
        element: elementRef.current!,
        type: ViewportType.VOLUME_3D,
        defaultOptions: { 
            orientation: Enums.OrientationAxis.ACQUISITION,
            background: [0, 0, 0] 
        },
      };

      renderingEngine.enableElement(viewportInput);

      // 6. Create ToolGroup
      const toolGroup = ToolGroupManager.createToolGroup(TOOL_GROUP_ID);
      if (toolGroup) {
          toolGroup.addTool(TrackballRotateTool.toolName);
          toolGroup.addTool(ZoomTool.toolName);
          toolGroup.addTool(PanTool.toolName);

          // Configure Inputs: Left Click Rotate, Right Click Zoom
          toolGroup.setToolActive(TrackballRotateTool.toolName, { 
              bindings: [{ mouseButton: MouseBindings.Primary }] 
          });
          toolGroup.setToolActive(ZoomTool.toolName, { 
              bindings: [{ mouseButton: MouseBindings.Secondary }] 
          });
          // Optional: Middle click to Pan
          toolGroup.setToolActive(PanTool.toolName, { 
              bindings: [{ mouseButton: MouseBindings.Auxiliary }] 
          });

          toolGroup.addViewport(VIEWPORT_ID_3D, RENDERING_ENGINE_ID);
      }

      // 7. Load Volume
      const volume = await volumeLoader.createAndCacheVolume(VOLUME_ID, { imageIds });
      await volume.load();

      await setVolumesForViewports(
        renderingEngine,
        [{ volumeId: VOLUME_ID }],
        [VIEWPORT_ID_3D]
      );

      // 8. Set Preset (Bone is usually good for 3D visibility)
      const viewport = renderingEngine.getViewport(VIEWPORT_ID_3D);
      if (viewport) {
         // @ts-ignore
         viewport.setProperties({ preset: 'CT-Bone' });
         viewport.render();
      }
    };

    run().catch(console.error);

    return () => {
      cancelled = true;
      try { ToolGroupManager.destroyToolGroup(TOOL_GROUP_ID); } catch(e){}
      const engine = getRenderingEngine(RENDERING_ENGINE_ID);
      if (engine) engine.destroy();
    };
  }, [imageIds]);

  return (
    <div style={{ width: '100%', height: '100%', background: 'black', position: 'relative' }}>
        <div style={{ 
            position: 'absolute', 
            top: 10, 
            left: 10, 
            color: '#3b82f6', 
            zIndex: 10, 
            fontWeight: 'bold', 
            pointerEvents: 'none' 
        }}>
            3D Volume
        </div>
        <div
            ref={elementRef}
            style={{ width: '100%', height: '100%' }}
            onContextMenu={(e) => e.preventDefault()}
        />
    </div>
  );
};

export default DicomViewer3D;