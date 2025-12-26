// components/level-1/DicomViewer/DicomViewer.tsx

import React, { useEffect, useRef, useState } from 'react';
import { RenderingEngine, Enums, init as coreInit, type Types } from '@cornerstonejs/core';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import * as cornerstoneTools from '@cornerstonejs/tools';

// --- NEW: Define the Preset Type ---
export interface VoiPreset {
  id: string;
  label: string;
  windowWidth: number;
  windowCenter: number;
}

interface DicomViewerProps {
  imageIds: string[];
  activeTool: string;
  viewportId: string;
  // --- NEW: Accept a preset prop ---
  activePreset?: VoiPreset | null; 
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
  AngleTool,
} = cornerstoneTools;

const DicomViewer: React.FC<DicomViewerProps> = ({ 
  imageIds, 
  activeTool, 
  viewportId, 
  activePreset
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const renderingEngineRef = useRef<RenderingEngine | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const toolGroupId = `TOOLGROUP_${viewportId}`; 

  // 1. INITIALIZATION (Same as before)
  useEffect(() => {
    const setup = async () => {
      // (Your existing setup code here... kept brief for readability)
      await coreInit();
      if (!(window as any).dicomWorkerRegistered) {
        await dicomImageLoaderInit();
        (window as any).dicomWorkerRegistered = true;
      }
      await cornerstoneTools.init();

      cornerstoneTools.addTool(WindowLevelTool);
      cornerstoneTools.addTool(PanTool);
      cornerstoneTools.addTool(ZoomTool);
      cornerstoneTools.addTool(StackScrollTool);
      cornerstoneTools.addTool(LengthTool);
      cornerstoneTools.addTool(PlanarRotateTool);
      cornerstoneTools.addTool(AngleTool);

      let toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
      if (!toolGroup) {
        toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
      }

      if (toolGroup) {
        // (Your existing tool bindings...)
        toolGroup.addTool(WindowLevelTool.toolName, {bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary}]});
        toolGroup.addTool(PanTool.toolName , {bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary}]});
        toolGroup.addTool(ZoomTool.toolName);
        toolGroup.addTool(StackScrollTool.toolName, {bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel}]});
        toolGroup.addTool(LengthTool.toolName);
        toolGroup.addTool(PlanarRotateTool.toolName);
        toolGroup.addTool(AngleTool.toolName);
      }

      const renderingEngineId = `ENGINE_${viewportId}`;
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

      setIsReady(true);
    };

    setup();

    return () => {
      ToolGroupManager.destroyToolGroup(toolGroupId);
      renderingEngineRef.current?.destroy();
    };
  }, [viewportId, toolGroupId]);

  // 2. LOAD IMAGES (Same as before)
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
  useEffect(() => {
    if (!isReady) return;
    const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
    if (!toolGroup) return;

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
      let toolBindings: any[] = [];

      switch (toolName) {
        case WindowLevelTool.toolName:
          toolBindings = isSelected 
            ? [{ mouseButton: MouseBindings.Primary }, { mouseButton: MouseBindings.Secondary }] 
            : [{ mouseButton: MouseBindings.Secondary }];
          break;
        case PanTool.toolName:
          toolBindings = isSelected 
            ? [{ mouseButton: MouseBindings.Primary }, { mouseButton: MouseBindings.Auxiliary }] 
            : [{ mouseButton: MouseBindings.Auxiliary }];
          break;
        case StackScrollTool.toolName:
          toolBindings = isSelected 
            ? [{ mouseButton: MouseBindings.Primary }, { mouseButton: MouseBindings.Wheel }] 
            : [{ mouseButton: MouseBindings.Wheel }];
          break;
        default:
          toolBindings = isSelected ? [{ mouseButton: MouseBindings.Primary }] : [];
          break;
      }

      toolGroup.setToolPassive(toolName);
      if (toolBindings.length > 0) {
        toolGroup.setToolActive(toolName, { bindings: toolBindings });
      }
    });

    renderingEngineRef.current?.getViewport(viewportId)?.render();
  }, [activeTool, isReady, toolGroupId, viewportId]);

  useEffect(() => {
    // 1. Safety Checks
    if (!isReady || !activePreset || !renderingEngineRef.current) return;

    const viewport = renderingEngineRef.current.getViewport(viewportId) as Types.IStackViewport;
    
    if (viewport) {
      const { windowWidth, windowCenter } = activePreset;

      const lower = windowCenter - windowWidth / 2;
      const upper = windowCenter + windowWidth / 2;

      //  Apply the VOI (View of Interest)
      viewport.setVOI({ lower, upper });
      
      viewport.render();
    }
  }, [activePreset, isReady, viewportId]);
useEffect(() => {
    if (!elementRef.current || !renderingEngineRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (renderingEngineRef.current) {
        // Tells the engine to look at the DOM size and update the canvas size
        renderingEngineRef.current.resize(true, false);
      }
    });

    resizeObserver.observe(elementRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isReady]); // Re-run if ready state changes to ensure engine exist
  return (
    <div 
      ref={elementRef} 
      style={{ width: '100%', height: '100%', overflow: 'hidden'}}
      onContextMenu={(e) => e.preventDefault()} 
    />
  );
};

export default DicomViewer;