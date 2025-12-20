#!/usr/bin/env python3
"""
Quick test script to verify CUDA setup and model loading
Run this before starting the full FastAPI service
"""

import torch
import sys
from pathlib import Path

def check_cuda():
    """Check CUDA availability and GPU info"""
    print("=" * 60)
    print("🔍 CUDA VERIFICATION")
    print("=" * 60)
    
    print(f"\n✓ PyTorch Version: {torch.__version__}")
    print(f"✓ CUDA Available: {torch.cuda.is_available()}")
    
    if torch.cuda.is_available():
        print(f"✓ CUDA Version: {torch.version.cuda}")
        print(f"✓ cuDNN Version: {torch.backends.cudnn.version()}")
        print(f"✓ Number of GPUs: {torch.cuda.device_count()}")
        
        for i in range(torch.cuda.device_count()):
            print(f"\n📊 GPU {i}: {torch.cuda.get_device_name(i)}")
            props = torch.cuda.get_device_properties(i)
            print(f"   - Total Memory: {props.total_memory / 1e9:.2f} GB")
            print(f"   - Compute Capability: {props.major}.{props.minor}")
            
        # Test tensor creation on GPU
        print("\n🧪 Testing GPU tensor operations...")
        test_tensor = torch.randn(1000, 1000).cuda()
        result = test_tensor @ test_tensor.T
        print(f"   ✓ Matrix multiplication successful")
        print(f"   ✓ Result shape: {result.shape}")
        print(f"   ✓ Device: {result.device}")
        
        # Check memory
        allocated = torch.cuda.memory_allocated(0) / 1e6
        cached = torch.cuda.memory_reserved(0) / 1e6
        print(f"\n💾 GPU Memory:")
        print(f"   - Allocated: {allocated:.1f} MB")
        print(f"   - Cached: {cached:.1f} MB")
        
        print("\n✅ CUDA is ready to use!")
        return True
    else:
        print("\n⚠️  CUDA not available - will run on CPU")
        print("\nTo enable GPU:")
        print("1. Install CUDA Toolkit: https://developer.nvidia.com/cuda-downloads")
        print("2. Install PyTorch with CUDA: pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118")
        return False

def check_models():
    """Check if model files exist"""
    print("\n" + "=" * 60)
    print("📦 MODEL FILES CHECK")
    print("=" * 60)
    
    model_files = ['models/acl_model.pth', 'models/meniscus_model.pth', 'models/abnormal_model.pth']
    all_found = True
    
    for model_file in model_files:
        path = Path(model_file)
        if path.exists():
            size = path.stat().st_size / 1e6
            print(f"✓ {model_file} ({size:.1f} MB)")
        else:
            print(f"✗ {model_file} NOT FOUND")
            all_found = False
    
    if all_found:
        print("\n✅ All model files present")
    else:
        print("\n⚠️  Some model files are missing")
    
    return all_found

def test_model_loading():
    """Test loading a model on GPU"""
    print("\n" + "=" * 60)
    print("🧠 MODEL LOADING TEST")
    print("=" * 60)
    
    if not torch.cuda.is_available():
        print("⚠️  Skipping (CUDA not available)")
        return
    
    try:
        import torch.nn as nn
        from torchvision import models
        
        # Define same model as in main.py
        class MRNetModel(nn.Module):
            def __init__(self):
                super().__init__()
                self.backbone = models.resnet18(pretrained=False)
                self.backbone.fc = nn.Sequential(nn.Dropout(0.5), nn.Linear(512, 1))
            def forward(self, x):
                return self.backbone(x)
        
        device = torch.device("cuda")
        print(f"\n📍 Target device: {device}")
        
        # Test loading one model
        if Path('models/acl_model.pth').exists():
            print("\n⏳ Loading ACL model...")
            model = MRNetModel().to(device)
            model.load_state_dict(torch.load('models/acl_model.pth', map_location=device))
            model.eval()
            
            print(f"✓ Model loaded successfully")
            print(f"✓ Model device: {next(model.parameters()).device}")
            
            # Test inference
            print("\n🧪 Testing inference...")
            dummy_input = torch.randn(1, 3, 256, 256).to(device)
            print(f"✓ Input tensor device: {dummy_input.device}")
            
            with torch.no_grad():
                output = model(dummy_input)
                prob = torch.sigmoid(output).item()
            
            print(f"✓ Output: {output.item():.4f}")
            print(f"✓ Probability: {prob:.4f}")
            
            # Check memory after inference
            allocated = torch.cuda.memory_allocated(0) / 1e6
            print(f"\n💾 GPU Memory after inference: {allocated:.1f} MB")
            
            print("\n✅ Model inference successful on GPU!")
        else:
            print("⚠️  acl_model.pth not found - skipping test")
            
    except Exception as e:
        print(f"\n❌ Error during model test: {str(e)}")
        import traceback
        traceback.print_exc()

def main():
    print("\n" + "🚀" * 30)
    print("FASTAPI AI SERVICE - CUDA VERIFICATION")
    print("🚀" * 30 + "\n")
    
    cuda_ok = check_cuda()
    models_ok = check_models()
    
    if cuda_ok and models_ok:
        test_model_loading()
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    if cuda_ok and models_ok:
        print("✅ System is ready for GPU-accelerated inference!")
        print("\nYou can now start the service:")
        print("   python main.py")
        return 0
    else:
        if not cuda_ok:
            print("⚠️  CUDA not available - service will run on CPU")
        if not models_ok:
            print("⚠️  Some model files are missing")
        print("\nService can still start but performance may be limited")
        return 1

if __name__ == "__main__":
    sys.exit(main())
