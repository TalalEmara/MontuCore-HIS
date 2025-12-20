from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import torch
import torch.nn as nn
from torchvision import models, transforms
import pydicom
import numpy as np
from PIL import Image
import io
import requests
import base64
import cv2
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
import logging
from typing import Optional, Dict, Any
import traceback

# --- LOGGING SETUP ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CDSS AI Service",
    description="Deep Learning CDSS for ACL and Meniscus Detection",
    version="1.0.0"
)

# --- CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your Express backend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIG ---
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
logger.info(f"🔧 Using device: {device}")

if torch.cuda.is_available():
    logger.info(f"🚀 GPU: {torch.cuda.get_device_name(0)}")
    logger.info(f"💾 GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
    logger.info(f"⚡ CUDA Version: {torch.version.cuda}")
    # Enable cudnn benchmarking for better performance
    torch.backends.cudnn.benchmark = True
    logger.info("✅ cuDNN benchmarking enabled for optimal performance")
else:
    logger.warning("⚠️  CUDA not available - Running on CPU (slower inference)")

# --- MODEL DEFINITION ---
class MRNetModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.backbone = models.resnet18(pretrained=False)
        self.backbone.fc = nn.Sequential(nn.Dropout(0.5), nn.Linear(512, 1))
    def forward(self, x):
        return self.backbone(x)

# --- LOAD MODELS ---
models_dict = {}
MODEL_PATHS = {
    'acl': 'models/acl_model.pth',
    'meniscus': 'models/meniscus_model.pth',
    'abnormal': 'models/abnormal_model.pth'
}

for task, path in MODEL_PATHS.items():
    try:
        model = MRNetModel().to(device)
        model.load_state_dict(torch.load(path, map_location=device, weights_only=True))
        model.eval()
        # Ensure model stays on correct device
        model = model.to(device)
        models_dict[task] = model
        logger.info(f"✅ Loaded {task} model from {path} → {device}")
    except FileNotFoundError:
        logger.warning(f"⚠️  Model file not found: {path}")
    except Exception as e:
        logger.error(f"❌ Failed to load {task} model: {str(e)}")

if not models_dict:
    logger.error("❌ No models loaded! AI service will not function properly.")
else:
    logger.info(f"✅ Successfully loaded {len(models_dict)} model(s)")
    if torch.cuda.is_available():
        allocated = torch.cuda.memory_allocated(0) / 1e6
        cached = torch.cuda.memory_reserved(0) / 1e6
        logger.info(f"💾 GPU Memory: {allocated:.1f} MB allocated, {cached:.1f} MB cached")

# --- HELPER: MIDDLE SLICE LOGIC ---
def process_dicom(file_bytes: bytes) -> tuple:
    """
    Reads DICOM bytes, finds middle slice, converts to 3-channel tensor.
    
    Args:
        file_bytes: Raw DICOM file bytes
        
    Returns:
        tuple: (input_tensor, original_img_array)
        
    Raises:
        HTTPException: If DICOM processing fails
    """
    try:
        ds = pydicom.dcmread(io.BytesIO(file_bytes))
        pixel_array = ds.pixel_array.astype(float)
        
        logger.info(f"📊 DICOM shape: {pixel_array.shape}, dtype: {pixel_array.dtype}")
        
        # If 3D Volume (Slices, H, W) -> Extract Middle 3
        if len(pixel_array.shape) == 3:
            num_slices = pixel_array.shape[0]
            mid = num_slices // 2
            
            logger.info(f"🎯 Using middle slice: {mid}/{num_slices}")
            
            # Handle boundary cases
            prev_idx = max(0, mid - 1)
            next_idx = min(num_slices - 1, mid + 1)
            
            prev = pixel_array[prev_idx]
            curr = pixel_array[mid]
            next_s = pixel_array[next_idx]
            
            # Stack to (H, W, 3) for RGB-like format
            img_stack = np.stack([prev, curr, next_s], axis=-1)
            
        elif len(pixel_array.shape) == 2:
            # If 2D Image -> Duplicate channels
            logger.info("📷 Processing 2D DICOM image")
            img_stack = np.stack([pixel_array]*3, axis=-1)
        else:
            raise ValueError(f"Unexpected DICOM shape: {pixel_array.shape}")

        # Normalize to 0-255 range
        img_min = np.min(img_stack)
        img_max = np.max(img_stack)
        
        if img_max > img_min:
            img_stack = ((img_stack - img_min) / (img_max - img_min)) * 255.0
        else:
            img_stack = np.zeros_like(img_stack)
            
        img_stack = np.uint8(img_stack)
        
        logger.info(f"✅ Normalized image range: [{img_stack.min()}, {img_stack.max()}]")
        
        # Prepare for Tensor (PyTorch expects CHW format)
        transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((256, 256)),
            transforms.ToTensor(),
            # Add normalization if your model was trained with it
            # transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        # Return both Tensor (for AI) and Numpy (for Heatmap visualization)
        tensor = transform(img_stack).unsqueeze(0).to(device)
        
        logger.info(f"✅ Tensor shape: {tensor.shape}, device: {tensor.device}")
        
        return tensor, img_stack
        
    except pydicom.errors.InvalidDicomError as e:
        logger.error(f"❌ Invalid DICOM file: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid DICOM file: {str(e)}")
    except Exception as e:
        logger.error(f"❌ DICOM processing error: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"DICOM processing failed: {str(e)}")

# --- HELPER: GENERATE HEATMAP ---
def generate_heatmap(model: nn.Module, tensor: torch.Tensor, original_img: np.ndarray) -> str:
    """
    Generates Grad-CAM heatmap visualization.
    
    Args:
        model: PyTorch model
        tensor: Input tensor
        original_img: Original image array (H, W, 3)
        
    Returns:
        Base64 encoded PNG image string
    """
    try:
        target_layers = [model.backbone.layer4[-1]]
        cam = GradCAM(model=model, target_layers=target_layers)
        
        # Generate CAM
        grayscale_cam = cam(input_tensor=tensor, targets=[ClassifierOutputTarget(0)])[0, :]
        
        # Resize original image to match tensor size (256x256) for visualization
        original_resized = cv2.resize(original_img, (256, 256))
        
        # Normalize to [0, 1] range
        original_normalized = original_resized.astype(np.float32) / 255.0
        
        # Overlay heatmap on original image
        visualization = show_cam_on_image(original_normalized, grayscale_cam, use_rgb=True)
        
        # Convert to Base64 string to send to Frontend
        img = Image.fromarray(visualization)
        buff = io.BytesIO()
        img.save(buff, format="PNG")
        base64_str = base64.b64encode(buff.getvalue()).decode("utf-8")
        
        logger.info(f"✅ Generated heatmap (size: {len(base64_str)} chars)")
        
        return base64_str
        
    except Exception as e:
        logger.error(f"❌ Heatmap generation failed: {str(e)}")
        return ""  # Return empty string instead of crashing

# --- REQUEST/RESPONSE MODELS ---
class AnalysisRequest(BaseModel):
    dicomUrl: str
    patientId: Optional[int] = None
    examId: Optional[int] = None

class PredictionResult(BaseModel):
    probability: float
    confidence_level: str  # 'low', 'medium', 'high'
    heatmap: Optional[str] = None

class AnalysisResponse(BaseModel):
    success: bool
    acl: Optional[PredictionResult] = None
    meniscus: Optional[PredictionResult] = None
    abnormal: Optional[PredictionResult] = None
    abnormal_probability: float
    abnormal_detected: bool
    threshold: float = 0.5
    message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

def get_confidence_level(probability: float) -> str:
    """Categorize prediction confidence."""
    if probability >= 0.8:
        return "high"
    elif probability >= 0.5:
        return "medium"
    else:
        return "low"

# --- HEALTH CHECK ---
@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "service": "CDSS AI Service",
        "status": "running",
        "device": str(device),
        "models_loaded": list(models_dict.keys()),
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy" if models_dict else "degraded",
        "models": {
            task: "loaded" for task in models_dict.keys()
        },
        "device": str(device),
        "cuda_available": torch.cuda.is_available()
    }

# --- MAIN ANALYSIS ENDPOINT ---
@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_scan(request: AnalysisRequest):
    """
    Main endpoint for DICOM analysis.
    
    Downloads DICOM from URL, processes it, runs AI models, and returns predictions.
    """
    logger.info(f"🔍 Analysis request received for URL: {request.dicomUrl}")
    
    if not models_dict:
        raise HTTPException(
            status_code=503,
            detail="No AI models loaded. Service is not ready."
        )
    
    try:
        # 1. Download DICOM from Supabase
        logger.info(f"📥 Downloading DICOM from: {request.dicomUrl}")
        response = requests.get(request.dicomUrl, timeout=30)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to download DICOM. Status: {response.status_code}"
            )
        
        file_size = len(response.content)
        logger.info(f"✅ Downloaded {file_size} bytes")
        
        # 2. Process DICOM
        input_tensor, original_img = process_dicom(response.content)
        
        results = {
            'success': True,
            'metadata': {
                'file_size_bytes': file_size,
                'tensor_shape': list(input_tensor.shape),
                'patient_id': request.patientId,
                'exam_id': request.examId
            }
        }
        
        # 3. Run ACL Model
        if 'acl' in models_dict:
            logger.info("🧠 Running ACL model on {device}...")
            with torch.no_grad(), torch.cuda.amp.autocast(enabled=torch.cuda.is_available()):
                acl_out = models_dict['acl'](input_tensor)
                acl_prob = torch.sigmoid(acl_out).item()
            
            logger.info(f"📊 ACL probability: {acl_prob:.4f}")
            
            # Generate Heatmap for ACL
            heatmap_b64 = generate_heatmap(models_dict['acl'], input_tensor, original_img)
            
            results['acl'] = PredictionResult(
                probability=round(acl_prob, 4),
                confidence_level=get_confidence_level(acl_prob),
                heatmap=heatmap_b64 if heatmap_b64 else None
            )
        
        # 4. Run Meniscus Model
        if 'meniscus' in models_dict:
            logger.info("🧠 Running Meniscus model on {device}...")
            with torch.no_grad(), torch.cuda.amp.autocast(enabled=torch.cuda.is_available()):
                men_out = models_dict['meniscus'](input_tensor)
                men_prob = torch.sigmoid(men_out).item()
            
            logger.info(f"📊 Meniscus probability: {men_prob:.4f}")
            
            results['meniscus'] = PredictionResult(
                probability=round(men_prob, 4),
                confidence_level=get_confidence_level(men_prob),
                heatmap=None  # Optional: generate heatmap for meniscus too
            )

        # 5. Run Abnormal Model (if exists)
        abnormal_prob = 0.0
        if 'abnormal' in models_dict:
            logger.info("🧠 Running Abnormality model on {device}...")
            with torch.no_grad(), torch.cuda.amp.autocast(enabled=torch.cuda.is_available()):
                abn_out = models_dict['abnormal'](input_tensor)
                abnormal_prob = torch.sigmoid(abn_out).item()
            
            logger.info(f"📊 Abnormality probability: {abnormal_prob:.4f}")
            
            results['abnormal'] = PredictionResult(
                probability=round(abnormal_prob, 4),
                confidence_level=get_confidence_level(abnormal_prob),
                heatmap=None
            )
        else:
            # Fallback: use max of ACL and Meniscus if abnormal model not available
            if 'acl' in results and 'meniscus' in results:
                abnormal_prob = max(
                    results['acl'].probability,
                    results['meniscus'].probability
                )
            elif 'acl' in results:
                abnormal_prob = results['acl'].probability
            elif 'meniscus' in results:
                abnormal_prob = results['meniscus'].probability
        
        # Set abnormal detection results
        results['abnormal_probability'] = round(abnormal_prob, 4)
        results['abnormal_detected'] = abnormal_prob >= 0.5

        return AnalysisResponse(**results)
        
    except HTTPException:
        raise
    except requests.exceptions.Timeout:
        logger.error("❌ Download timeout")
        raise HTTPException(status_code=504, detail="DICOM download timeout")
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Download error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to download DICOM: {str(e)}")
    except Exception as e:
        logger.error(f"❌ Analysis error: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting CDSS AI Service...")
    uvicorn.run(app, host="0.0.0.0", port=5000)