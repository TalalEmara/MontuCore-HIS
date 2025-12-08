import React, { useEffect, useRef, useState } from 'react';
import { 
  RenderingEngine, 
  Enums, 
  init as coreInit,
  type Types 
} from '@cornerstonejs/core';
import { 
  init as dicomImageLoaderInit, 
  wadouri 
} from '@cornerstonejs/dicom-image-loader';
import * as cornerstoneTools from '@cornerstonejs/tools';

const {
  ToolGroupManager,
  Enums: csToolsEnums,
  WindowLevelTool,
  PanTool,
  ZoomTool,
  PlanarRotateTool,
  StackScrollTool,
} = cornerstoneTools;

const DicomLocalViewer: React.FC = () => {
  const elementRef = useRef<HTMLDivElement>(null);
  const renderingEngineRef = useRef<RenderingEngine | null>(null);
  const toolGroupId = 'MY_TOOLGROUP_ID';
  const viewportId = 'CT_AXIAL_STACK';

  // 1. STATE: Track which tool is currently on the Left Mouse Button
  const [activeLeftTool, setActiveLeftTool] = useState<string>(WindowLevelTool.toolName);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initial Setup (Mount only)
  useEffect(() => {
    const setup = async () => {
      await coreInit();
      await dicomImageLoaderInit();
      await cornerstoneTools.init();

      cornerstoneTools.addTool(WindowLevelTool);
      cornerstoneTools.addTool(PanTool);
      cornerstoneTools.addTool(ZoomTool);
      cornerstoneTools.addTool(PlanarRotateTool);
      cornerstoneTools.addTool(StackScrollTool);

      const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
      if (toolGroup) {
        toolGroup.addTool(WindowLevelTool.toolName);
        toolGroup.addTool(PanTool.toolName);
        toolGroup.addTool(ZoomTool.toolName);
        toolGroup.addTool(PlanarRotateTool.toolName);
        toolGroup.addTool(StackScrollTool.toolName);

        // Set initial "Permanent" tools (Right Click & Middle Click)
        toolGroup.setToolActive(PanTool.toolName, {
          bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
        });
        toolGroup.setToolActive(ZoomTool.toolName, {
          bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }],
        });
        toolGroup.setToolActive(StackScrollTool.toolName, {
          bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel }],
        });
      }

      const renderingEngineId = 'myRenderingEngine';
      const renderingEngine = new RenderingEngine(renderingEngineId);
      renderingEngineRef.current = renderingEngine;

      if (elementRef.current) {
        const viewportInput = {
          viewportId,
          element: elementRef.current,
          type: Enums.ViewportType.STACK,
        };
        renderingEngine.enableElement(viewportInput);
        toolGroup?.addViewport(viewportId, renderingEngineId);
      }

      // Mark as ready so our other effect can run
      setIsInitialized(true);
    };

    setup();

    return () => {
      ToolGroupManager.destroyToolGroup(toolGroupId);
      renderingEngineRef.current?.destroy();
    };
  }, []);


  // 2. EFFECT: The "Switcher" Logic
  // This runs whenever `activeLeftTool` changes.
  useEffect(() => {
    if (!isInitialized) return;

    const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
    if (!toolGroup) return;

    // A. Disable all potential "Left Click" tools first
    // This ensures we don't have two tools trying to use the Left Button
    const leftClickTools = [WindowLevelTool.toolName, PlanarRotateTool.toolName];
    
    leftClickTools.forEach(toolName => {
        toolGroup.setToolPassive(toolName);
    });

    // B. Enable the one selected in State
    toolGroup.setToolActive(activeLeftTool, {
      bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
    });

    // C. Update the viewport to reflect changes immediately
    const renderingEngine = renderingEngineRef.current;
    const viewport = renderingEngine?.getViewport(viewportId);
    viewport?.render();

  }, [activeLeftTool, isInitialized]); // <--- Dependencies


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !renderingEngineRef.current) return;
    const imageIds = Array.from(files).map((file) => wadouri.fileManager.add(file));
    const viewport = renderingEngineRef.current.getViewport(viewportId) as Types.IStackViewport;
    await viewport.setStack(imageIds, 0);
    viewport.render();
  };

  return (
    <div>
      <div style={{ marginBottom: '15px', padding: '10px', background: '#f0f0f0' }}>
        <h3>Toolbar</h3>
        
        {/* File Upload */}
        <input type="file" onChange={handleFileChange} multiple accept=".dcm" />
        
        <hr />

        {/* 3. UI: Controlled Inputs */}
        <label style={{ marginRight: '10px' }}><strong>Left Mouse Mode:</strong></label>
        
        <select 
            value={activeLeftTool} 
            onChange={(e) => setActiveLeftTool(e.target.value)}
            style={{ padding: '5px' }}
        >
            <option value={WindowLevelTool.toolName}>Contrast (Window/Level)</option>
            <option value={PlanarRotateTool.toolName}>Rotate</option>
        </select>

        <p style={{fontSize: '0.9em', color: '#666'}}>
           Current Mode: {activeLeftTool === WindowLevelTool.toolName ? "Contrast Adjustment" : "Rotation"}
        </p>
      </div>

      <div 
        ref={elementRef} 
        style={{ width: '100%', height: '60vh', backgroundColor: '#000' }} 
        onContextMenu={(e) => e.preventDefault()}
      ></div>
    </div>
  );
};

export default DicomLocalViewer;