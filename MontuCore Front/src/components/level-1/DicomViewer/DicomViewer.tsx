import React, { useEffect, useRef } from 'react';
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
// 1. Import Tools Library
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

  useEffect(() => {
    const setup = async () => {
      // Initialize Core, Loader, AND Tools
      await coreInit();
      await dicomImageLoaderInit();
      await cornerstoneTools.init(); // <--- Initialize Tools

      // 2. Add Tools to the Cornerstone engine
      cornerstoneTools.addTool(WindowLevelTool);
      cornerstoneTools.addTool(PanTool);
      cornerstoneTools.addTool(ZoomTool);
      cornerstoneTools.addTool(PlanarRotateTool);
      cornerstoneTools.addTool(StackScrollTool);

      // 3. Define a Tool Group (a set of tools for our viewport)
      const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
      if (toolGroup) {
        // Add tools to the group
        toolGroup.addTool(WindowLevelTool.toolName);
        toolGroup.addTool(PanTool.toolName);
        toolGroup.addTool(ZoomTool.toolName);
        toolGroup.addTool(PlanarRotateTool.toolName);
        toolGroup.addTool(StackScrollTool.toolName);

        // 4. Set Active Tools (Bind them to Mouse Buttons)
        toolGroup.setToolActive(WindowLevelTool.toolName, {
          bindings: [
            { mouseButton: csToolsEnums.MouseBindings.Primary }, // Left Click = Contrast
          ],
        });
        toolGroup.setToolActive(PanTool.toolName, {
          bindings: [
            { mouseButton: csToolsEnums.MouseBindings.Auxiliary }, // Middle Click = Pan
          ],
        });
        toolGroup.setToolActive(ZoomTool.toolName, {
          bindings: [
            { mouseButton: csToolsEnums.MouseBindings.Secondary }, // Right Click = Zoom
          ],
        });
        toolGroup.setToolActive(StackScrollTool.toolName,{
          bindings: [
            { mouseButton: csToolsEnums.MouseBindings.Wheel }, // Right Click = Zoom
          ],
        }); // Scroll Wheel = Next/Prev Image
      }

      // Create Rendering Engine
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
        
        // 5. Connect the Tool Group to the Viewport
        // This makes the tools work specifically on this HTML element
        toolGroup?.addViewport(viewportId, renderingEngineId);
      }
    };

    setup();

    return () => {
      // Cleanup tools and engine
      ToolGroupManager.destroyToolGroup(toolGroupId);
      if (renderingEngineRef.current) {
        renderingEngineRef.current.destroy();
      }
    };
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !renderingEngineRef.current) return;

    const fileArray = Array.from(files);
    const imageIds = fileArray.map((file) => wadouri.fileManager.add(file));

    const viewport = renderingEngineRef.current.getViewport(viewportId) as Types.IStackViewport;
    
    // Load images
    await viewport.setStack(imageIds, 0);
    viewport.render();
  };

  // Helper function to activate Rotate tool manually (optional button)
  const toggleRotate = () => {
    const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
    if (!toolGroup) return;

    // Switch Left Click to Rotate instead of WindowLevel
    toolGroup.setToolActive(PlanarRotateTool.toolName, {
        bindings: [ { mouseButton: csToolsEnums.MouseBindings.Primary } ],
    });
    // Set WindowLevel to passive so it doesn't conflict
    toolGroup.setToolPassive(WindowLevelTool.toolName);
  };

  const resetTools = () => {
    const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
    if (!toolGroup) return;
    
    // Restore WindowLevel to Left Click
    toolGroup.setToolActive(WindowLevelTool.toolName, {
        bindings: [ { mouseButton: csToolsEnums.MouseBindings.Primary } ],
    });
    toolGroup.setToolPassive(PlanarRotateTool.toolName);
  };

  return (
    <div>
      <div style={{ marginBottom: '10px', display:'flex', gap:'10px' }}>
        <input type="file" onChange={handleFileChange} multiple accept=".dcm" />
        
        {/* Simple buttons to switch modes if needed */}
        <button onClick={toggleRotate}>Enable Rotate (Left Click)</button>
        <button onClick={resetTools}>Reset to Contrast (Left Click)</button>
      </div>

      <div 
        ref={elementRef} 
        style={{ 
          width: '100%', 
          height: '60vh',
          backgroundColor: '#000',
          border: '1px solid #444' 
        }} 
        // Prevent right-click context menu so Zoom works
        onContextMenu={(e) => e.preventDefault()}
      >
      </div>
    </div>
  );
};

export default DicomLocalViewer;