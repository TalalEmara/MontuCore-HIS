import React, { useState, useEffect, useRef } from 'react';
// import { DicomViewer } from './DicomViewer';
import { useDicomUpload } from '../../hooks/useDicomUpload';
import axios from 'axios';

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

export const DicomTestPage: React.FC = () => {
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [examId, setExamId] = useState<number>(1); // Test with exam ID
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload functionality
  const [caseId, setCaseId] = useState<number>(7); // Default case ID
  const [uploadMode, setUploadMode] = useState<'new' | 'existing'>('new');
  const [loadExamId, setLoadExamId] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadToNewExam, uploadToExistingExam, isUploading, uploadProgress, error: uploadError } = useDicomUpload();

  // Function to handle file upload
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
      setLoadExamId(result.id); // Update the load exam ID to the newly created exam
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  // Function to load exam data by ID
  const loadExam = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/exams/${id}`);
      setExamData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load exam');
      console.error('Load exam error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load exam on component mount (optional)
  useEffect(() => {
    if (examId) {
      loadExam(examId);
    }
  }, []);

  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1>DICOM Viewer Test Page</h1>

      {/* Upload Section */}
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Upload DICOM Files</h3>

        {/* Upload Mode Selection */}
        <div style={{ marginBottom: '15px' }}>
          <label>
            <input
              type="radio"
              value="new"
              checked={uploadMode === 'new'}
              onChange={(e) => setUploadMode(e.target.value as 'new')}
            />
            Create New Exam
          </label>
          <label style={{ marginLeft: '20px' }}>
            <input
              type="radio"
              value="existing"
              checked={uploadMode === 'existing'}
              onChange={(e) => setUploadMode(e.target.value as 'existing')}
            />
            Add to Existing Exam
          </label>
        </div>

        {/* Case ID Input (for new exam) */}
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

        {/* Exam ID Input (for existing exam) */}
        {uploadMode === 'existing' && (
          <div style={{ marginBottom: '10px' }}>
            <label>
              Exam ID:
              <input
                type="number"
                value={examId || ''}
                onChange={(e) => setExamId(parseInt(e.target.value))}
                style={{ marginLeft: '10px', padding: '5px' }}
              />
            </label>
          </div>
        )}

        {/* File Input */}
        <div style={{ marginBottom: '10px' }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".dcm,.dicom"
            onChange={handleFileSelect}
            disabled={isUploading}
            style={{ marginRight: '10px' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{
              padding: '5px 15px',
              backgroundColor: isUploading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isUploading ? 'not-allowed' : 'pointer'
            }}
          >
            {isUploading ? 'Uploading...' : 'Select DICOM Files'}
          </button>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ width: '100%', backgroundColor: '#f3f3f3', borderRadius: '4px' }}>
              <div
                style={{
                  width: `${uploadProgress}%`,
                  height: '20px',
                  backgroundColor: '#007bff',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <p>{uploadProgress}% uploaded</p>
          </div>
        )}

        {/* Upload Error */}
        {uploadError && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            Upload Error: {uploadError}
          </div>
        )}
      </div>

      {/* Exam Loader */}
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Load Exam by ID</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Exam ID:
            <input
              type="number"
              value={loadExamId}
              onChange={(e) => setLoadExamId(parseInt(e.target.value))}
              style={{ marginLeft: '10px', padding: '5px' }}
            />
          </label>
          <button
            onClick={() => loadExam(loadExamId)}
            disabled={loading}
            style={{
              marginLeft: '10px',
              padding: '5px 15px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Load Exam'}
          </button>
        </div>

        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            Error: {error}
          </div>
        )}

        {examData && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <h4>Exam #{examData.id}</h4>
            <p><strong>Case:</strong> {examData.caseId}</p>
            <p><strong>Modality:</strong> {examData.modality}</p>
            <p><strong>Body Part:</strong> {examData.bodyPart}</p>
            <p><strong>Status:</strong> {examData.status}</p>
            <p><strong>DICOM Images:</strong> {examData.pacsImages.length}</p>
          </div>
        )}
      </div>

      {/* DICOM Viewer */}
      {/* {examData && examData.pacsImages.length > 0 && (
        <div style={{ flex: 1, border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
          <h3>DICOM Viewer - {examData.pacsImages.length} images</h3>
          <DicomViewer
            imageUrls={examData.pacsImages.map(img => img.publicUrl)}
          />
        </div>
      )} */}

      {/* Instructions */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h4>Testing Instructions:</h4>
        <ol>
          <li><strong>Upload DICOMs:</strong> Choose "Create New Exam" or "Add to Existing Exam" mode</li>
          <li><strong>Select Files:</strong> Click "Select DICOM Files" and choose .dcm files from your computer</li>
          <li><strong>Upload:</strong> Files will be uploaded automatically and exam data will be displayed</li>
          <li><strong>View Images:</strong> DICOM viewer will display the images with mouse wheel scrolling</li>
          <li><strong>Load Existing:</strong> Use "Load Exam by ID" to view previously uploaded exams</li>
        </ol>

        <h4>Sample DICOM Files:</h4>
        <p>You can find sample DICOM files in the <code>dicom_images/</code> folder of your project:</p>
        <ul>
          <li><code>demo_pure_acl_1177_Abn68_Acl86_Men16.dcm</code></li>
          <li><code>demo_dual_injury_1178_Abn96_Acl92_Men85.npy</code> (convert to .dcm first)</li>
          <li>Other .dcm files in the folder</li>
        </ul>

        <h4>Controls:</h4>
        <ul>
          <li><strong>Mouse Wheel:</strong> Scroll through image slices</li>
          <li><strong>Left Click + Drag:</strong> Pan the image</li>
          <li><strong>Right Click + Drag:</strong> Zoom in/out</li>
        </ul>
      </div>
    </div>
  );
};

export default DicomTestPage;