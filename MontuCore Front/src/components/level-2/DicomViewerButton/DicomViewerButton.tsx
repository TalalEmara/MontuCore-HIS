// components/level-2/DicomViewerButton/DicomViewerButton.tsx
import React, { useState } from 'react';
import { Eye, X } from 'lucide-react';

interface DicomViewerButtonProps {
  dicomUrl?: string;
  dicomFileName?: string;
  examId: number;
  modality?: string;
}

const DicomViewerButton: React.FC<DicomViewerButtonProps> = ({
  dicomUrl,
  dicomFileName,
  examId,
  modality
}) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  if (!dicomUrl) {
    return null; // Don't render if no DICOM URL
  }

  const handleViewDicom = () => {
    // Open DICOM viewer in a new tab/window with the URL
    const viewerUrl = `/dicom-viewer?url=${encodeURIComponent(dicomUrl)}&examId=${examId}&fileName=${encodeURIComponent(dicomFileName || 'dicom.dcm')}&modality=${modality || 'UNKNOWN'}`;
    window.open(viewerUrl, '_blank');
  };

  return (
    <>
      <button
        onClick={handleViewDicom}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        title={`View DICOM: ${dicomFileName || 'DICOM file'}`}
      >
        <Eye className="w-4 h-4 mr-1.5" />
        View DICOM
      </button>
    </>
  );
};

export default DicomViewerButton;