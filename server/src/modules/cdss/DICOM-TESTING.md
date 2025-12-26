# CDSS DICOM Analysis - Test Guide

## 🔬 Computer Vision Features

The DICOM endpoint now includes:

- **📊 Image Analysis**: Brightness, contrast, sharpness detection
- **🎯 Abnormality Detection**: Threshold-based anomaly detection
- **📍 Region of Interest**: Identifies abnormal regions with coordinates
- **🏷️ Auto-Classification**: Determines imaging type from DICOM metadata
- **⚖️ Severity Assessment**: Auto-assigns severity based on findings

---

## 🚀 New Endpoint

### POST `/api/cdss/analyze-dicom`

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `dicomFile` (file): DICOM image file (.dcm) or test image (PNG/JPG)
- `name` (text): Athlete name
- `age` (number): Athlete age
- `sport` (text): Athlete sport

**Response**:
```json
{
  "success": true,
  "athlete": {
    "name": "John Doe",
    "age": 28,
    "sport": "soccer"
  },
  "visionAnalysis": {
    "imageType": "musculoskeletal",
    "findings": {
      "brightness": 0.65,
      "contrast": 0.42,
      "sharpness": 0.38,
      "hasAbnormality": true,
      "abnormalityScore": 0.73,
      "regionOfInterest": {
        "x": 120,
        "y": 85,
        "width": 50,
        "height": 50
      }
    },
    "metadata": {
      "modality": "MR",
      "bodyPart": "KNEE",
      "width": 512,
      "height": 512
    }
  },
  "cdssAnalysis": {
    "alerts": [...],
    "riskScore": {...},
    "returnToPlay": {...}
  }
}
```

---

## 🧪 Testing with PowerShell

### Test with Image File (PNG/JPG as substitute for DICOM)

```powershell
# Create a test request with a sample image
$filePath = "C:\path\to\test-image.png"  # Use any medical image
$uri = "http://localhost:5000/api/cdss/analyze-dicom"

# Create form data
$form = @{
    dicomFile = Get-Item -Path $filePath
    name = "Test Athlete"
    age = "25"
    sport = "basketball"
}

# Send request
Invoke-RestMethod -Uri $uri -Method POST -Form $form
```

### Test with cURL (Alternative)

```powershell
curl.exe -X POST http://localhost:5000/api/cdss/analyze-dicom `
  -F "dicomFile=@test-image.png" `
  -F "name=John Doe" `
  -F "age=28" `
  -F "sport=soccer"
```

---

## 🖼️ Computer Vision Analysis Details

### 1. **Brightness Analysis**
- Calculates average pixel intensity (0-1)
- Higher values = brighter image
- Used for quality assessment

### 2. **Contrast Analysis**
- Measures standard deviation of pixel intensities
- Higher values = better contrast
- Low contrast (<0.2) triggers quality warning

### 3. **Sharpness Analysis**
- Uses Laplacian edge detection
- Higher values = sharper edges
- Low sharpness (<0.1) indicates blur

### 4. **Abnormality Detection**
- Threshold-based: pixels 50% brighter than mean
- Calculates abnormality percentage
- >10% abnormal pixels triggers alert
- Provides region of interest (ROI) coordinates

### 5. **Severity Mapping**
```typescript
abnormalityScore > 0.7 → HIGH severity
abnormalityScore > 0.4 → MEDIUM severity
Otherwise → LOW severity
```

---

## 📋 Image Type Auto-Detection

The system determines imaging type from DICOM metadata:

**Cardiac**:
- CT/MR with body part: "heart", "cardiac"
- Study description contains "cardiac"

**Neurological**:
- Body part: "brain", "head", "skull"
- MR with "brain" in description

**Musculoskeletal**:
- Body part: "knee", "ankle", "shoulder", "hip", "spine"
- Default for orthopedic scans

**Unknown**:
- Falls back to musculoskeletal for CDSS analysis

---

## 🎯 Example Outputs

### High Severity Detection
```json
{
  "visionAnalysis": {
    "findings": {
      "abnormalityScore": 0.85,
      "hasAbnormality": true
    },
    "severity": "high",
    "textFindings": "MR imaging of KNEE. Significant abnormal region detected at coordinates (120, 85)."
  }
}
```

### Low Quality Image
```json
{
  "visionAnalysis": {
    "findings": {
      "contrast": 0.15,
      "sharpness": 0.08
    },
    "textFindings": "Image quality: low contrast. Image appears blurred."
  }
}
```

---

## ⚠️ Notes

- **File Upload Limit**: 50MB max
- **Supported Formats**: DICOM (.dcm), PNG, JPG (for testing)
- **Automatic Cleanup**: Uploaded files deleted after processing
- **DICOM Pixel Data**: Simplified extraction (production would need full DICOM parser)
- **Fallback**: If DICOM parsing fails, treats as regular image

---

## 🔄 Workflow

```
1. Upload DICOM file
   ↓
2. Parse DICOM metadata (modality, body part)
   ↓
3. Extract pixel data / image buffer
   ↓
4. Computer Vision Analysis
   - Brightness, contrast, sharpness
   - Abnormality detection
   - ROI identification
   ↓
5. Auto-determine imaging type & severity
   ↓
6. Generate text findings
   ↓
7. Run CDSS analysis with structured data
   ↓
8. Return combined results
```

---

## 🛠️ Development Notes

- `vision.service.ts`: All computer vision logic
- `sharp`: Image processing library
- `dicom-parser`: DICOM file parsing
- `multer`: File upload handling
- Files stored temporarily in `./uploads/dicom/`
