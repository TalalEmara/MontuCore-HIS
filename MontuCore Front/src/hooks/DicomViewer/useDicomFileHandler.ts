import { useState, useCallback } from 'react';
import { wadouri } from '@cornerstonejs/dicom-image-loader';

export const useDicomFileHandler = () => {
  const [imageIds, setImageIds] = useState<string[]>([]);

  // We use useCallback to ensure this function reference doesn't change 
  // unnecessarily, preventing re-renders in child components.
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    // Safety checks
    if (!files || files.length === 0) {
      return;
    }

    // 1. Convert FileList (browser object) to a standard Array
    const fileArray = Array.from(files);

    // 2. Register each file with the Cornerstone File Manager.
    // This returns a unique string ID (e.g., "dicomfile:uuid") for each file
    // that the rendering engine can use to look up the data in memory.
    const newImageIds = fileArray.map((file) => {
      return wadouri.fileManager.add(file);
    });

    // 3. Update the state
    setImageIds(newImageIds);
  }, []);

  return {
    imageIds,
    handleFileChange,
  };
};