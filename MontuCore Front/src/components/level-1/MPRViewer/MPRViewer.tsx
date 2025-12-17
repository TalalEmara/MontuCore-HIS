import React, { useEffect, useRef } from "react";
import {
  init as coreInit,
  RenderingEngine,
  Enums,
  volumeLoader,
  setVolumesForViewports,
  imageLoader,
  getRenderingEngine,
  type Types,
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
        try {
          cornerstoneTools.addTool(toolClass);
        } catch (e) {}
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

      // Clean up old engine safely

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

      // Clean up old ToolGroup safely

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

        // // <--- 6. NEW: Right Click to Rotate 3D

        // toolGroup.setToolActive(TrackballRotateTool.toolName, {

        //      bindings: [{ mouseButton: MouseBindings.Secondary }]

        // });

        toolGroup.addViewport(VIEWPORT_IDS.AXIAL, RENDERING_ENGINE_ID);

        toolGroup.addViewport(VIEWPORT_IDS.SAGITTAL, RENDERING_ENGINE_ID);

        toolGroup.addViewport(VIEWPORT_IDS.CORONAL, RENDERING_ENGINE_ID);

        // toolGroup.addViewport(VIEWPORT_IDS.VOLUME_3D, RENDERING_ENGINE_ID); // <--- NEW
      }

      // Sync (Simplified cleanup to avoid crash)

      try {
        // If we can't find it easily, we just try to create.

        // If it throws "already exists", the previous cleanup failed, but we catch it here.

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
        console.warn("Synchronizer creation warning:", err);
      }

      const volume = await volumeLoader.createAndCacheVolume(VOLUME_ID, {
        imageIds,
      });

      await volume.load();

      await setVolumesForViewports(
        renderingEngine,

        [{ volumeId: VOLUME_ID }],

        [
          VIEWPORT_IDS.AXIAL,
          VIEWPORT_IDS.SAGITTAL,
          VIEWPORT_IDS.CORONAL,
        ] // <--- NEW
      );

      renderingEngine.render();
    };

    run().catch(console.error);

    return () => {
      cancelled = true;

      // FIX: Use Manager to destroy

      try {
        ToolGroupManager.destroyToolGroup(TOOL_GROUP_ID);
      } catch (e) {}

      if (voiSyncRef.current) {
        try {
          voiSyncRef.current.destroy();
        } catch (e) {}

        voiSyncRef.current = null;
      }

      if (renderingEngineRef.current) {
        try {
          renderingEngineRef.current.destroy();
        } catch (e) {}

        renderingEngineRef.current = null;
      }
    };
  }, [imageIds]);

  // --- Effect 2: Tool Switching ---

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        height: "100%",
      }}
    >
      {/* 7. NEW: 2x2 Grid */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns: "1fr 1fr",

          gridTemplateRows: "1fr 1fr",

          gap: "4px",

          height: "100%",
        }}
      >
        <ViewportContainer title="Axial" refProp={axialRef} color="#c91633" />

        <ViewportContainer
          title="Sagittal"
          refProp={sagittalRef}
          color="#ffae00"
        />

        <ViewportContainer
          title="Coronal"
          refProp={coronalRef}
          color="#5FDD9D"
        />

      </div>
    </div>
  );
};

// Sub-components

const ViewportContainer = ({ title, refProp, color }: any) => (
  <div
    style={{
      position: "relative",
      width: "100%",
      height: "100%",
      minHeight: "300px",
      overflow: "hidden",
      background: "black",
    }}
  >
    <div
      style={{
        position: "absolute",

        top: 8,

        left: 8,

        color: color,

        zIndex: 10,

        fontWeight: "bold",

        fontSize: "14px",

        textShadow: "0 0 2px black",
      }}
    >
      {title}
    </div>

    <div
      ref={refProp}
      style={{ width: "100%", height: "100%" }}
      onContextMenu={(e) => e.preventDefault()}
    />
  </div>
);

export default MPRViewer;
