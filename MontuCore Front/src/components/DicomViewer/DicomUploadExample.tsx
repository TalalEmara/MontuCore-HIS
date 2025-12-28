import React, { useState, useRef } from 'react';
import { DicomViewer } from '../components/DicomViewer/DicomViewer';
import { useDicomUpload } from '../hooks/useDicomUpload';

interface ExamData {
  id: number;
  caseId: number;
  modality: string;
  bodyPart: string;
  status: string;
  pacsImages: Array<{
    id: number;
    fileName: string;
    publicUrl: string;
  }>;
}

export const DicomUploadExample: React.FC = () => {
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [caseId, setCaseId] = useState<number>(7); // Default case ID
  const [examId, setExamId] = useState<number | null>(null); // For adding to existing exam
  const [uploadMode, setUploadMode] = useState<'new' | 'existing'>('new');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadToNewExam, uploadToExistingExam, isUploading, uploadProgress, error } = useDicomUpload();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      let result: ExamData;
      if (uploadMode === 'new') {
        result = await uploadToNewExam(files, caseId, {
          modality: 'MRI',
          bodyPart: 'Knee'
        });
      } else {
        if (!examId) {
          alert('Please enter an exam ID');
          return;
        }
        result = await uploadToExistingExam(files, examId);
      }

      setExamData(result);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h2>DICOM Series Upload & Viewer</h2>

      {/* Upload Section */}
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Upload DICOM Series</h3>

        {/* Mode Selection */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ marginRight: '20px' }}>
            <input
              type="radio"
              value="new"
              checked={uploadMode === 'new'}
              onChange={(e) => setUploadMode(e.target.value as 'new')}
            />
            Create New Exam
          </label>
          <label>
            <input
              type="radio"
              value="existing"
              checked={uploadMode === 'existing'}
              onChange={(e) => setUploadMode(e.target.value as 'existing')}
            />
            Add to Existing Exam
          </label>
        </div>

        {/* Case ID input (for new exams) */}
        {uploadMode === 'new' && (
          <div style={{ marginBottom: '10px' }}>
            <label>
              Case ID:
              <input
                type="number"
                value={caseId}
                onChange={(e) => setCaseId(parseInt(e.target.value))}
                style={{ marginLeft: '10px', padding: '5px' }}
              />
            </label>
          </div>
        )}

        {/* Exam ID input (for existing exams) */}
        {uploadMode === 'existing' && (
          <div style={{ marginBottom: '10px' }}>
            <label>
              Exam ID:
              <input
                type="number"
                value={examId || ''}
                onChange={(e) => setExamId(parseInt(e.target.value) || null)}
                style={{ marginLeft: '10px', padding: '5px' }}
                placeholder="Enter existing exam ID"
              />
            </label>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".dcm,.dicom"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <button
          onClick={handleUploadClick}
          disabled={isUploading || (uploadMode === 'existing' && !examId)}
          style={{
            padding: '10px 20px',
            backgroundColor: isUploading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isUploading ? 'not-allowed' : 'pointer'
          }}
        >
          {isUploading ? 'Uploading...' : `Select DICOM Files (${uploadMode === 'new' ? 'New Exam' : 'Existing Exam'})`}
        </button>

        {isUploading && (
          <div style={{ marginTop: '10px' }}>
            <progress value={uploadProgress} max={100} style={{ width: '100%' }} />
            <span>{Math.round(uploadProgress)}%</span>
          </div>
        )}

        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            Error: {error}
          </div>
        )}
      </div>

      {/* Viewer Section */}
      {examData && examData.pacsImages.length > 0 && (
        <div style={{ flex: 1, border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
          <h3>Exam #{examData.id} - {examData.pacsImages.length} DICOM Images</h3>
          <DicomViewer
            imageUrls={examData.pacsImages.map(img => img.publicUrl)}
          />
        </div>
      )}

      {/* Instructions */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h4>Instructions:</h4>
        <ul>
          <li><strong>New Exam:</strong> Select case ID, upload DICOM files - creates new exam automatically</li>
          <li><strong>Existing Exam:</strong> Enter exam ID, upload DICOM files - adds to existing exam</li>
          <li>Files are sent directly to backend for processing and Supabase upload</li>
          <li>DICOM metadata populates exam fields automatically</li>
          <li>Use mouse wheel to scroll through image slices</li>
          <li>Left click to pan, right click to zoom</li>
        </ul>
      </div>
    </div>
  );
};

export default DicomUploadExample;