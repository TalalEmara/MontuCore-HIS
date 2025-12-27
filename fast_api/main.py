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

# --- HELPER: PROCESS SINGLE DICOM SLICE ---
def process_dicom(file_bytes: bytes) -> tuple:
    """
    Reads DICOM bytes for a single sagittal slice, converts to 1-channel tensor.
    Uses the same preprocessing pipeline as training for maximum accuracy.
    
    Args:
        file_bytes: Raw DICOM file bytes
        
    Returns:
        tuple: (input_tensor, visual_img_array)
            - input_tensor: Float32 tensor for AI model (1, 1, 256, 256)
            - visual_img_array: Uint8 array for heatmap visualization (H, W)
        
    Raises:
        HTTPException: If DICOM processing fails
    """
    try:
        ds = pydicom.dcmread(io.BytesIO(file_bytes))
        # 1. Keep as FLOAT32 (Crucial for precision - matches training)
        pixel_array = ds.pixel_array.astype(np.float32)
        
        logger.info(f"📊 DICOM shape: {pixel_array.shape}, dtype: {pixel_array.dtype}")
        
        # 2. Expect 2D DICOM (single slice)
        if len(pixel_array.shape) != 2:
            raise ValueError(f"Expected 2D DICOM slice, got shape: {pixel_array.shape}")
        
        # --- PATH A: FOR AI MODEL (High Precision) ---
        # Convert directly to Tensor without rounding to 0-255 uint8
        tensor = torch.from_numpy(pixel_array)
        
        # Add channel dimension: (H, W) -> (1, H, W)
        tensor = tensor.unsqueeze(0)
        
        # Exact Normalization from Training: (x - min) / (max - min)
        if tensor.max() > tensor.min():
            tensor = (tensor - tensor.min()) / (tensor.max() - tensor.min())
        else:
            tensor = torch.zeros_like(tensor)

        # Resize using Tensor method (preserves float precision)
        # Note: We use antialias=True to match modern PIL resizing
        resize_transform = transforms.Resize((256, 256), antialias=True)
        tensor = resize_transform(tensor).unsqueeze(0).to(device)  # (1, 1, 256, 256)
        
        logger.info(f"✅ Tensor shape: {tensor.shape}, device: {tensor.device}, dtype: {tensor.dtype}")

        # --- PATH B: FOR HEATMAP (Visual only) ---
        # Create uint8 version just for heatmap generation
        img_min, img_max = pixel_array.min(), pixel_array.max()
        if img_max > img_min:
            img_visual = ((pixel_array - img_min) / (img_max - img_min)) * 255.0
        else:
            img_visual = np.zeros_like(pixel_array)
        img_visual = np.uint8(img_visual)
        
        logger.info(f"✅ Visual image range: [{img_visual.min()}, {img_visual.max()}]")

        return tensor, img_visual
        
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
        tensor: Input tensor (1, 3, 256, 256)
        original_img: Original image array (H, W) grayscale
        
    Returns:
        Base64 encoded PNG image string
    """
    try:
        target_layers = [model.backbone.layer4[-1]]
        cam = GradCAM(model=model, target_layers=target_layers)
        
        # Generate CAM
        grayscale_cam = cam(input_tensor=tensor, targets=[ClassifierOutputTarget(0)])[0, :]
        
        # Resize original image to match tensor size (256x256) and convert to RGB
        original_resized = cv2.resize(original_img, (256, 256))
        
        # Convert grayscale to RGB by stacking
        original_rgb = np.stack([original_resized] * 3, axis=-1)
        
        # Normalize to [0, 1] range
        original_normalized = original_rgb.astype(np.float32) / 255.0
        
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
    dicomUrls: list[str]  # Exactly 3 URLs for sagittal slices
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
    
    Downloads 3 DICOM sagittal slices from URLs, stacks them, runs AI models, and returns predictions.
    """
    logger.info(f"🔍 Analysis request received for {len(request.dicomUrls)} DICOM URLs")
    
    if not models_dict:
        raise HTTPException(
            status_code=503,
            detail="No AI models loaded. Service is not ready."
        )
    
    if len(request.dicomUrls) != 3:
        raise HTTPException(
            status_code=400,
            detail="Exactly 3 DICOM URLs are required"
        )
    
    try:
        # 1. Download and process 3 DICOM slices
        tensors = []
        visual_imgs = []
        total_file_size = 0
        
        for i, dicom_url in enumerate(request.dicomUrls):
            logger.info(f"📥 Downloading DICOM {i+1}/3 from: {dicom_url}")
            response = requests.get(dicom_url, timeout=30)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to download DICOM {i+1}. Status: {response.status_code}"
                )
            
            file_size = len(response.content)
            total_file_size += file_size
            logger.info(f"✅ Downloaded DICOM {i+1}: {file_size} bytes")
            
            # Process single slice
            tensor, visual_img = process_dicom(response.content)
            tensors.append(tensor)
            visual_imgs.append(visual_img)
        
        # Stack the three slices into 3-channel tensor
        input_tensor = torch.cat(tensors, dim=1)  # (1, 3, 256, 256)
        logger.info(f"✅ Stacked tensor shape: {input_tensor.shape}")
        
        # Use middle slice for heatmap visualization
        original_img = visual_imgs[1]
        
        results = {
            'success': True,
            'metadata': {
                'total_file_size_bytes': total_file_size,
                'tensor_shape': list(input_tensor.shape),
                'patient_id': request.patientId,
                'exam_id': request.examId,
                'dicom_urls': request.dicomUrls
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