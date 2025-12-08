import React, { useEffect, useRef, useState } from 'react';
import { RenderingEngine, Enums, init as coreInit, type Types } from '@cornerstonejs/core';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import * as cornerstoneTools from '@cornerstonejs/tools';

// Define the Props this component accepts
interface DicomViewerProps {
  imageIds: string[];      // The stack of images
  activeTool: string;      // 'WindowLevel', 'Pan', 'Zoom', etc.
  viewportId: string;      // UNIQUE ID (e.g., "left-viewport")
}

const {
  ToolGroupManager,
  Enums: csToolsEnums,
  WindowLevelTool,
  PanTool,
  ZoomTool,
  StackScrollTool,
  LengthTool,
  PlanarRotateTool,
  AngleTool, // Added Angle tool
} = cornerstoneTools;

const DicomViewer: React.FC<DicomViewerProps> = ({ imageIds, activeTool, viewportId }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const renderingEngineRef = useRef<RenderingEngine | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // Create a unique tool group ID for this specific viewport
  const toolGroupId = `TOOLGROUP_${viewportId}`; 

  // 1. INITIALIZATION (Runs once on mount)
  useEffect(() => {
    const setup = async () => {
      // A. Init Libraries (Safe to call multiple times)
      await coreInit();
      await dicomImageLoaderInit();
      await cornerstoneTools.init();

      // B. Register Tools Globally
      cornerstoneTools.addTool(WindowLevelTool);
      cornerstoneTools.addTool(PanTool);
      cornerstoneTools.addTool(ZoomTool);
      cornerstoneTools.addTool(StackScrollTool);
      cornerstoneTools.addTool(LengthTool);
      cornerstoneTools.addTool(PlanarRotateTool);
      cornerstoneTools.addTool(AngleTool);

      // C. Create Tool Group
      // Check if it exists first to prevent errors on re-renders
      let toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
      if (!toolGroup) {
        toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
      }

      if (toolGroup) {
        // Add tools to this group
        toolGroup.addTool(WindowLevelTool.toolName, {bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary}]});
        toolGroup.addTool(PanTool.toolName , {bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary}]});
        toolGroup.addTool(ZoomTool.toolName);
        toolGroup.addTool(StackScrollTool.toolName, {bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel}]});
        toolGroup.addTool(LengthTool.toolName);
        toolGroup.addTool(PlanarRotateTool.toolName);
        toolGroup.addTool(AngleTool.toolName);

      }

      // D. Initialize Rendering Engine
      const renderingEngineId = `ENGINE_${viewportId}`;
      const renderingEngine = new RenderingEngine(renderingEngineId);
      renderingEngineRef.current = renderingEngine;

      // E. Enable the Element
      if (elementRef.current) {
        const viewportInput = {
          viewportId,
          element: elementRef.current,
          type: Enums.ViewportType.STACK,
        };
        renderingEngine.enableElement(viewportInput);
        
        // Connect tools to this viewport
        toolGroup?.addViewport(viewportId, renderingEngineId);
      }

      setIsReady(true);
    };

    setup();

    // Cleanup on unmount
    return () => {
      // Optional: Destroying toolgroups can sometimes cause issues if navigating back quickly, 
      // but strictly good practice.
      ToolGroupManager.destroyToolGroup(toolGroupId);
      renderingEngineRef.current?.destroy();
    };
  }, [viewportId, toolGroupId]);

  // 2. LOAD IMAGES (Runs when imageIds change)
  useEffect(() => {
    if (!isReady || !renderingEngineRef.current || imageIds.length === 0) return;

    const loadImages = async () => {
      const viewport = renderingEngineRef.current?.getViewport(viewportId) as Types.IStackViewport;
      if (viewport) {
        await viewport.setStack(imageIds, 0);
        viewport.render();
      }
    };
    loadImages();
  }, [isReady, imageIds, viewportId]);

  // 3. TOOL SWITCHING (Runs when activeTool changes)
  // 3. TOOL SWITCHING (Runs when activeTool changes)
  useEffect(() => {
    if (!isReady) return;
    const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
    if (!toolGroup) return;

    // Define all tools that need to be managed
    const controllableTools = [
      WindowLevelTool.toolName,
      PanTool.toolName,
      ZoomTool.toolName,
      StackScrollTool.toolName,
      LengthTool.toolName,
      PlanarRotateTool.toolName,
      AngleTool.toolName,
    ];

    const MouseBindings = csToolsEnums.MouseBindings;

    controllableTools.forEach((toolName) => {
      const isSelected = toolName === activeTool;
      console.log(`Configuring tool: ${toolName}, isSelected: ${isSelected}`);
      // Define bindings based on the tool's specific requirements
      let toolBindings: any[] = [];

      switch (toolName) {
        // CASE A: Tools with Permanent Bindings (Right/Middle/Wheel)
        case WindowLevelTool.toolName:
          // Always Right Click (Secondary). If selected, add Left Click (Primary).
          toolBindings = isSelected 
            ? [{ mouseButton: MouseBindings.Primary }, { mouseButton: MouseBindings.Secondary }] 
            : [{ mouseButton: MouseBindings.Secondary }];
          break;

        case PanTool.toolName:
          // Always Middle Click (Auxiliary). If selected, add Left Click (Primary).
          toolBindings = isSelected 
            ? [{ mouseButton: MouseBindings.Primary }, { mouseButton: MouseBindings.Auxiliary }] 
            : [{ mouseButton: MouseBindings.Auxiliary }];
          break;

        case StackScrollTool.toolName:
          // Always Scroll Wheel. If selected, add Left Click (Primary) for drag.
          toolBindings = isSelected 
            ? [{ mouseButton: MouseBindings.Primary }, { mouseButton: MouseBindings.Wheel }] 
            : [{ mouseButton: MouseBindings.Wheel }];
          break;

        // CASE B: Standard Tools (Left Click Only)
        default:
          // (Zoom, Length, Angle, etc.) -> Active only if selected.
          toolBindings = isSelected 
            ? [{ mouseButton: MouseBindings.Primary }] 
            : [];
          break;
      }
// 1. WIPE CLEAN: Set Passive first to remove ALL previous bindings (Left/Right/etc)
      toolGroup.setToolPassive(toolName);

      // 2. RE-APPLY: Set Active only with the specific bindings we calculated
      if (toolBindings.length > 0) {
        toolGroup.setToolActive(toolName, { bindings: toolBindings });
      }
    
    });

    // Render to update cursor/state
    renderingEngineRef.current?.getViewport(viewportId)?.render();

  }, [activeTool, isReady, toolGroupId, viewportId]);



  return (
    <>
    <p>{activeTool}</p>
    <div 
      ref={elementRef} 
      style={{ width: '100%', height: '100%'}}
      // Prevent browser menu on Right Click (so Zoom works)
      onContextMenu={(e) => e.preventDefault()} 
    /></>
  );
};

export default DicomViewer;