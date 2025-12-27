import React, { useEffect, useRef } from "react";
import {
  init as coreInit,
  RenderingEngine,
  Enums,
  volumeLoader,
  setVolumesForViewports,
  imageLoader,
  getRenderingEngine,
  metaData,
  cache,
  type Types,
  utilities, // Import utilities for vector math
} from "@cornerstonejs/core";

import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
import * as cornerstoneTools from "@cornerstonejs/tools";
import { synchronizers } from "@cornerstonejs/tools";

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

type MPRViewerProps = {
  imageIds: string[];
  activeTool: string;
};

const RENDERING_ENGINE_ID = "myRenderingEngine";
const TOOL_GROUP_ID = "myToolGroup";
const VOLUME_ID = "myVolume";
const SYNC_ID_VOI = "myVOISynchronizer";

const VIEWPORT_IDS = {
  AXIAL: "AXIAL",
  SAGITTAL: "SAGITTAL",
  CORONAL: "CORONAL",
};

export const MPRViewer: React.FC<MPRViewerProps> = ({
  imageIds,
  activeTool,
}) => {
  const axialRef = useRef<HTMLDivElement | null>(null);
  const sagittalRef = useRef<HTMLDivElement | null>(null);
  const coronalRef = useRef<HTMLDivElement | null>(null);
  const renderingEngineRef = useRef<RenderingEngine | null>(null);
  const toolGroupRef = useRef<any>(null);
  const voiSyncRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!imageIds || imageIds.length === 0) return;

      await coreInit();

      if (!(window as any).dicomLoaderInitialized) {
        await dicomImageLoaderInit();
        (window as any).dicomLoaderInitialized = true;
      }

      await cornerstoneTools.init();

      if (cancelled) return;

      const addToolSafe = (toolClass: any) => {
        try {
          cornerstoneTools.addTool(toolClass);
        } catch (e) {}
      };

      addToolSafe(WindowLevelTool);
      addToolSafe(ZoomTool);
      addToolSafe(PanTool);
      addToolSafe(StackScrollTool);
      addToolSafe(CrosshairsTool);

      // 1. Load the images
      console.log("Debug: Loading images into cache...");
      const loadPromises = imageIds.map((imageId) =>
        imageLoader.loadAndCacheImage(imageId)
      );

      await Promise.all(loadPromises);
      console.log("Debug: Images loaded.");

      if (cancelled) return;

      // ---------------------------------------------------------
      // FIX: Manually Calculate Slice Positions for Multiframe
      // ---------------------------------------------------------
      
      const customProvider = (type: string, id: string) => {
        if (type !== 'imagePlaneModule') return undefined;

        // 1. Get the image from cache
        const image = cache.getImage(id);
        if (!image) return undefined;

        const dataset = (image as any).data;
        if (!dataset) return undefined;

        // 2. Parse Frame Index from URL (e.g. ...&frame=5)
        let frameIndex = 0;
        const frameMatch = id.match(/&frame=(\d+)/);
        if (frameMatch && frameMatch[1]) {
            frameIndex = parseInt(frameMatch[1], 10);
        }

        // 3. Get Base Orientation
        let rowCosines = [1, 0, 0];
        let colCosines = [0, 1, 0];
        if (dataset.string('x00200037')) {
            const iop = dataset.string('x00200037').split('\\').map(parseFloat);
            if (iop.length === 6) {
                rowCosines = [iop[0], iop[1], iop[2]];
                colCosines = [iop[3], iop[4], iop[5]];
            }
        }

        // 4. Get Pixel Spacing (Row/Col)
        let rowPixelSpacing = 1.0;
        let colPixelSpacing = 1.0;
        if (dataset.string('x00280030')) {
            const spacing = dataset.string('x00280030').split('\\').map(parseFloat);
            if (spacing.length === 2) {
                rowPixelSpacing = spacing[0];
                colPixelSpacing = spacing[1];
            }
        }

        // 5. Get Slice Thickness / Spacing for Z-Calculation
        let sliceSpacing = 1.0; 
        // Try Spacing Between Slices (0018,0088)
        if (dataset.string('x00180088')) {
            sliceSpacing = parseFloat(dataset.string('x00180088'));
        } 
        // Or Slice Thickness (0018,0050)
        else if (dataset.string('x00180050')) {
            sliceSpacing = parseFloat(dataset.string('x00180050'));
        }

        // 6. Calculate Position (Origin)
        // If the dataset has a root position, use it as the base (Frame 0)
        let basePosition = [0, 0, 0];
        if (dataset.string('x00200032')) {
            basePosition = dataset.string('x00200032').split('\\').map(parseFloat);
        }

        // CALCULATE Z-OFFSET
        // Normal Vector = Row x Col
        const r = { x: rowCosines[0], y: rowCosines[1], z: rowCosines[2] };
        const c = { x: colCosines[0], y: colCosines[1], z: colCosines[2] };
        // Cross product manually:
        const normal = [
            r.y * c.z - r.z * c.y,
            r.z * c.x - r.x * c.z,
            r.x * c.y - r.y * c.x
        ];

        // New Position = Base + (FrameIndex * Spacing * Normal)
        const position = [
            basePosition[0] + (frameIndex * sliceSpacing * normal[0]),
            basePosition[1] + (frameIndex * sliceSpacing * normal[1]),
            basePosition[2] + (frameIndex * sliceSpacing * normal[2])
        ];

        return {
            imageOrientationPatient: [...rowCosines, ...colCosines],
            imagePositionPatient: position, // <--- Corrected unique position per frame
            pixelSpacing: [rowPixelSpacing, colPixelSpacing],
            rowCosines,
            columnCosines: colCosines,
            columns: image.columns,
            rows: image.rows,
            frameIndex: frameIndex
        };
      };

      // Register with very high priority to override default provider
      metaData.addProvider(customProvider, 10000);
      // ---------------------------------------------------------

      // Clean up old engine
      const existingEngine = getRenderingEngine(RENDERING_ENGINE_ID);
      if (existingEngine) existingEngine.destroy();

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

      // Clean up old ToolGroup
      if (ToolGroupManager.getToolGroup(TOOL_GROUP_ID)) {
        ToolGroupManager.destroyToolGroup(TOOL_GROUP_ID);
      }

      const toolGroup = ToolGroupManager.createToolGroup(TOOL_GROUP_ID);
      toolGroupRef.current = toolGroup;

      if (toolGroup) {
        toolGroup.addTool(WindowLevelTool.toolName);
        toolGroup.addTool(ZoomTool.toolName);
        toolGroup.addTool(PanTool.toolName);
        toolGroup.addTool(StackScrollTool.toolName);
        toolGroup.addTool(CrosshairsTool.toolName, {
          viewportIdentifiers: [
            VIEWPORT_IDS.AXIAL,
            VIEWPORT_IDS.SAGITTAL,
            VIEWPORT_IDS.CORONAL,
          ],
        });

        toolGroup.setToolActive(WindowLevelTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Primary }],
        });
        toolGroup.setToolActive(ZoomTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Secondary }],
        });
        toolGroup.setToolActive(StackScrollTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Wheel }],
        });

        toolGroup.addViewport(VIEWPORT_IDS.AXIAL, RENDERING_ENGINE_ID);
        toolGroup.addViewport(VIEWPORT_IDS.SAGITTAL, RENDERING_ENGINE_ID);
        toolGroup.addViewport(VIEWPORT_IDS.CORONAL, RENDERING_ENGINE_ID);
      }

      // Sync
      try {
        const voiSynchronizer = createVOISynchronizer(SYNC_ID_VOI, {
          syncInvertState: false,
          syncColormap: false,
        });
        voiSyncRef.current = voiSynchronizer;

        [
          VIEWPORT_IDS.AXIAL,
          VIEWPORT_IDS.SAGITTAL,
          VIEWPORT_IDS.CORONAL,
        ].forEach((id) => {
          voiSynchronizer.add({
            renderingEngineId: RENDERING_ENGINE_ID,
            viewportId: id,
          });
        });
      } catch (err) {
        console.warn("Synchronizer warning:", err);
      }

      try {
        const volume = await volumeLoader.createAndCacheVolume(VOLUME_ID, {
          imageIds: imageIds,
        });

        await volume.load();

        await setVolumesForViewports(
          renderingEngine,
          [{ volumeId: VOLUME_ID }],
          [VIEWPORT_IDS.AXIAL, VIEWPORT_IDS.SAGITTAL, VIEWPORT_IDS.CORONAL]
        );

        renderingEngine.render();
      } catch (e) {
        console.error("Volume loading failed:", e);
      }
    };

    run().catch(console.error);

    return () => {
      cancelled = true;
      try {
        ToolGroupManager.destroyToolGroup(TOOL_GROUP_ID);
      } catch (e) {}
      if (voiSyncRef.current) {
        try { voiSyncRef.current.destroy(); } catch (e) {}
        voiSyncRef.current = null;
      }
      if (renderingEngineRef.current) {
        try { renderingEngineRef.current.destroy(); } catch (e) {}
        renderingEngineRef.current = null;
      }
    };
  }, [imageIds]);

  useEffect(() => {
    const toolGroup = ToolGroupManager.getToolGroup(TOOL_GROUP_ID);
    if (!toolGroup) return;

    const currentPrimary = toolGroup.getActivePrimaryMouseButtonTool();
    if (currentPrimary) toolGroup.setToolPassive(currentPrimary);

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
    if (renderingEngine) renderingEngine.render();
  }, [activeTool]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", height: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "4px", height: "100%" }}>
        <ViewportContainer title="Axial" refProp={axialRef} color="#c91633" />
        <ViewportContainer title="Sagittal" refProp={sagittalRef} color="#ffae00" />
        <ViewportContainer title="Coronal" refProp={coronalRef} color="#5FDD9D" />
      </div>
    </div>
  );
};

const ViewportContainer = ({ title, refProp, color }: any) => (
  <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "300px", overflow: "hidden", background: "black" }}>
    <div style={{ position: "absolute", top: 8, left: 8, color: color, zIndex: 10, fontWeight: "bold", fontSize: "14px", textShadow: "0 0 2px black" }}>
      {title}
    </div>
    <div ref={refProp} style={{ width: "100%", height: "100%" }} onContextMenu={(e) => e.preventDefault()} />
  </div>
);

export default MPRViewer;