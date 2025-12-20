# CDSS AI Service - Setup and Deployment Guide

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│                                                              │
│  - Upload DICOM                                             │
│  - Display heatmaps                                         │
│  - Show AI predictions                                      │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Express.js Backend (Node.ts)                    │
│                                                              │
│  - Prisma ORM + Supabase                                   │
│  - /api/cdss/analyze-dicom endpoint                        │
│  - Stores DICOM URLs                                       │
└────────────────────┬────────────────────────────────────────┘
                     │ axios POST
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           Python FastAPI Service (Port 5000)                 │
│                                                              │
│  - Download DICOM from URL                                  │
│  - Preprocess (middle slice extraction)                    │
│  - PyTorch ResNet18 models                                 │
│  - Grad-CAM heatmap generation                             │
│  - Return predictions + Base64 heatmap                     │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Python Service Setup

```bash
cd fast_api

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Place your trained models in this directory:
# - acl_model.pth
# - meniscus_model.pth
# - abnormal_model.pth

# Start the service
python main.py
# Or use uvicorn directly:
uvicorn main:app --reload --port 5000
```

The AI service will start on `http://localhost:5000`

### 2. Express Backend Configuration

Add to your `.env` file:

```env
AI_SERVICE_URL=http://localhost:5000
```

The Express backend will automatically connect to the AI service.

### 3. Verify Setup

Test the AI service health:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "models": {
    "acl": "loaded",
    "meniscus": "loaded",
    "abnormal": "loaded"
  },
  "device": "cuda",
  "cuda_available": true
}
```

## 📡 API Endpoints

### Python FastAPI Service

#### GET `/`
Health check endpoint.

**Response:**
```json
{
  "service": "CDSS AI Service",
  "status": "running",
  "device": "cuda",
  "models_loaded": ["acl", "meniscus", "abnormal"],
  "version": "1.0.0"
}
```

#### GET `/health`
Detailed health status.

#### POST `/analyze`
Main AI analysis endpoint.

**Request:**
```json
{
  "dicomUrl": "https://supabase.co/.../scan.dcm",
  "patientId": 6,
  "examId": 1
}
```

**Response:**
```json
{
  "success": true,
  "acl": {
    "probability": 0.8834,
    "confidence_level": "high",
    "heatmap": "iVBORw0KGgoAAAANSUhEUgAA..."
  },
  "meniscus": {
    "probability": 0.1245,
    "confidence_level": "low",
    "heatmap": null
  },
  "abnormal": {
    "probability": 0.7523,
    "confidence_level": "medium",
    "heatmap": null
  },
  "abnormal_probability": 0.7523,
  "abnormal_detected": true,
  "threshold": 0.5,
  "metadata": {
    "file_size_bytes": 524288,
    "tensor_shape": [1, 3, 256, 256],
    "patient_id": 6,
    "exam_id": 1
  }
}
```

### Express.js Backend

#### POST `/api/cdss/analyze-dicom`
Proxy endpoint that calls the AI service.

**Request:**
```json
{
  "dicomUrl": "https://supabase.co/.../scan.dcm",
  "patientId": 6,
  "examId": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "acl": { ... },
      "meniscus": { ... },
      "abnormalModel": {
        "probability": 0.7523,
        "confidence_level": "medium"
      },
      "abnormalOverall": {
        "detected": true,
        "probability": 0.7523,
        "threshold": 0.5
      }
    },
    "metadata": {
      "patientId": 6,
      "examId": 1,
      "analyzedAt": "2025-12-20T10:30:00.000Z",
      "aiServiceUrl": "http://localhost:5000",
      "modelsUsed": ["acl", "meniscus", "abnormal"]
    }
  },
  "message": "Abnormality detected - Review recommended"
}
```

## 🔧 Technical Details

### DICOM Preprocessing

1. **Download**: Fetch DICOM from Supabase URL
2. **Parse**: Use pydicom to read pixel array
3. **Slice Selection**: 
   - For 3D volumes: Extract middle slice ± 1
   - For 2D images: Duplicate to 3 channels
4. **Normalization**: Scale to 0-255 range
5. **Resize**: Transform to 256x256
6. **Tensor**: Convert to PyTorch tensor (1, 3, 256, 256)

### Model Architecture

- **Base**: ResNet18 (pretrained weights)
- **Output**: Binary classification (1 neuron)
- **Activation**: Sigmoid for probability
- **Dropout**: 0.5 before final layer

### Grad-CAM Heatmap

- **Target Layer**: `backbone.layer4[-1]`
- **Method**: Gradient-weighted Class Activation Mapping
- **Output**: Base64 encoded PNG overlay
- **Size**: 256x256 pixels

### Confidence Levels

- **High**: probability ≥ 0.8
- **Medium**: 0.5 ≤ probability < 0.8
- **Low**: probability < 0.5

## 🐛 Troubleshooting

### AI Service Won't Start

**Error**: `ModuleNotFoundError: No module named 'torch'`
```bash
pip install -r requirements.txt
```

**Error**: `FileNotFoundError: acl_model.pth not found`
- Ensure model files are in the `fast_api/` directory
- Check exact filename spelling

### Connection Refused

**Error**: `ECONNREFUSED` from Express
- Verify AI service is running: `curl http://localhost:5000`
- Check port 5000 is not blocked by firewall
- Ensure `AI_SERVICE_URL` in .env is correct

### DICOM Download Fails

**Error**: `Failed to download DICOM. Status: 403`
- Check Supabase bucket permissions (should be public)
- Verify URL is correct and accessible
- Test URL directly in browser

### Low Performance

- **Use GPU**: Ensure CUDA is available
- **Batch Processing**: Modify code to handle multiple files
- **Model Quantization**: Use TorchScript or ONNX for faster inference

## 📦 Production Deployment

### Docker (Recommended)

Create `Dockerfile` in `fast_api/`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Copy model files
COPY acl_model.pth .
COPY meniscus_model.pth .

EXPOSE 5000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
```

Build and run:
```bash
docker build -t cdss-ai-service .
docker run -p 5000:5000 cdss-ai-service
```

### Cloud Deployment Options

1. **AWS EC2 with GPU** (p2/p3 instances)
2. **Google Cloud Run** (with Cloud GPUs)
3. **Azure Container Instances**
4. **Heroku** (CPU only, slower)

### Environment Variables

```env
# Python Service
CUDA_VISIBLE_DEVICES=0  # GPU selection
LOG_LEVEL=INFO

# Express Backend
AI_SERVICE_URL=https://your-ai-service.com
AI_SERVICE_TIMEOUT=60000
```

## 🧪 Testing

### Unit Test (Python)

```python
import requests

response = requests.post(
    "http://localhost:5000/analyze",
    json={"dicomUrl": "https://example.com/test.dcm"}
)

print(response.json())
```

### Integration Test (Express)

```bash
curl -X POST http://localhost:3000/api/cdss/analyze-dicom \
  -H "Content-Type: application/json" \
  -d '{
    "dicomUrl": "https://supabase.co/.../scan.dcm",
    "patientId": 6,
    "examId": 1
  }'
```

## 📊 Performance Benchmarks

- **DICOM Download**: ~1-3 seconds (depends on file size)
- **Preprocessing**: ~0.5 seconds
- **ACL Inference**: ~0.1 seconds (GPU) / ~1 second (CPU)
- **Meniscus Inference**: ~0.1 seconds (GPU) / ~1 second (CPU)
- **Abnormal Inference**: ~0.1 seconds (GPU) / ~1 second (CPU)
- **Heatmap Generation**: ~0.5 seconds
- **Total**: ~2-6 seconds (GPU) / ~6-12 seconds (CPU)

## 📝 Model Training Notes

If you need to retrain models:

1. Use the same ResNet18 architecture
2. Save with `torch.save(model.state_dict(), 'model_name.pth')`
3. Ensure output layer is `nn.Linear(512, 1)` for binary classification
4. Training on MRNet dataset recommended

## 🔐 Security Considerations

- **Rate Limiting**: Add rate limits to prevent abuse
- **Authentication**: Secure endpoints with JWT in production
- **Input Validation**: Validate DICOM URLs (whitelist Supabase domain)
- **Model Security**: Keep model weights secure and private
- **CORS**: Restrict origins in production

## 📚 Additional Resources

- [PyTorch Documentation](https://pytorch.org/docs/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydicom Guide](https://pydicom.github.io/)
- [Grad-CAM Paper](https://arxiv.org/abs/1610.02391)
