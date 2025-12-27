"""
CDSS API Testing Script
Tests the full pipeline: sends 3 DICOM URLs to API and visualizes results
"""

import requests
import json
import base64
from PIL import Image
from io import BytesIO
import os
from datetime import datetime

# Configuration
API_URL = "http://localhost:3000/api/cdss/analyze-dicom"
FASTAPI_URL = "http://localhost:5000/analyze"

def decode_and_save_heatmap(base64_str, model_name, output_dir="./test_results"):
    """Decode base64 heatmap and save as image"""
    if not base64_str:
        return None
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Remove data URI prefix if present
    if base64_str.startswith('data:image'):
        base64_str = base64_str.split(',')[1]
    
    # Decode and save
    img_data = base64.b64decode(base64_str)
    img = Image.open(BytesIO(img_data))
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{output_dir}/{model_name}_heatmap_{timestamp}.png"
    img.save(filename)
    
    print(f"✅ Saved {model_name} heatmap to: {filename}")
    return filename

def print_results_summary(response_data):
    """Print JSON response without base64 images"""
    print("\n" + "="*80)
    print("📊 CDSS ANALYSIS RESULTS")
    print("="*80)
    
    # Primary Diagnosis (if available and corresponds to highest probability model)
    if 'diagnosis' in response_data and response_data['diagnosis']:
        diag = response_data['diagnosis']
        severity_emoji = {
            'normal': '✅',
            'low': '⚠️ ',
            'moderate': '🟠',
            'high': '🔴'
        }.get(diag.get('severity', ''), '❓')
        
        print(f"\n🩺 PRIMARY DIAGNOSIS: {severity_emoji} {diag.get('primary', 'Unknown').upper()}")
        print(f"   Severity: {diag.get('severity', 'Unknown').upper()}")
        print(f"   Confidence: {diag.get('confidence', 0):.4f} ({diag.get('confidence', 0)*100:.2f}%)")
        print(f"   Details: {diag.get('details', 'No details')}")
    else:
        print("\n🩺 PRIMARY DIAGNOSIS: Not determined (diagnosis doesn't match highest probability model)")
    
    
    # Metadata (if available)
    if 'metadata' in response_data:
        print("\n📋 Metadata:")
        for key, value in response_data['metadata'].items():
            if key != 'modelsUsed':
                print(f"  {key}: {value}")
        if 'modelsUsed' in response_data['metadata']:
            print(f"  Models Used: {', '.join(response_data['metadata']['modelsUsed'])}")
    
    # Get diagnosis data for model results
    diagnosis_data = response_data.get('diagnosis', {})
    
    # ACL Results
    if 'acl' in diagnosis_data and diagnosis_data['acl']:
        print("\n🦵 ACL Tear Detection:")
        print(f"  Probability: {diagnosis_data['acl']['probability']:.4f} ({diagnosis_data['acl']['probability']*100:.2f}%)")
        print(f"  Confidence: {diagnosis_data['acl']['confidence_level']}")
        print(f"  Heatmap: {'✅ Available' if response_data.get('heatmap') else '❌ Not available'}")
    else:
        print("\n🦵 ACL Tear Detection: No full results (lower probability model)")
    
    # Meniscus Results
    if 'meniscus' in diagnosis_data and diagnosis_data['meniscus']:
        print("\n🔍 Meniscus Tear Detection:")
        print(f"  Probability: {diagnosis_data['meniscus']['probability']:.4f} ({diagnosis_data['meniscus']['probability']*100:.2f}%)")
        print(f"  Confidence: {diagnosis_data['meniscus']['confidence_level']}")
        print(f"  Heatmap: {'✅ Available' if response_data.get('heatmap') else '❌ Not available'}")
    else:
        print("\n🔍 Meniscus Tear Detection: No full results (lower probability model)")
    
    # Abnormal Model Results
    if 'abnormal' in diagnosis_data and diagnosis_data['abnormal']:
        print("\n⚠️  General Abnormality Detection:")
        print(f"  Probability: {diagnosis_data['abnormal']['probability']:.4f} ({diagnosis_data['abnormal']['probability']*100:.2f}%)")
        print(f"  Confidence: {diagnosis_data['abnormal']['confidence_level']}")
        print(f"  Heatmap: {'✅ Available' if response_data.get('heatmap') else '❌ Not available'}")
    else:
        print("\n⚠️  General Abnormality Detection: No full results (lower probability model)")
    
    # Overall Assessment
    if 'abnormal_detected' in response_data:
        print("\n🎯 Overall Assessment:")
        print(f"  Abnormal Detected: {'⚠️  YES' if response_data['abnormal_detected'] else '✅ NO'}")
        print(f"  Overall Abnormality: {response_data['abnormal_probability']:.4f} ({response_data['abnormal_probability']*100:.2f}%)")
        if 'threshold' in response_data:
            print(f"  Threshold: {response_data['threshold']}")
        if 'abnormalProbability' in response_data:
            print(f"  Overall Abnormality: {response_data['abnormalProbability']:.4f} ({response_data['abnormalProbability']*100:.2f}%)")
    
    print("\n" + "="*80)

def test_express_endpoint(dicom_urls, patient_id=6, exam_id=1):
    """Test via Express server (port 3000)"""
    print("\n🔵 Testing Express Backend (http://localhost:3000/api/cdss/analyze-dicom)")
    print(f"📁 DICOM URLs: {dicom_urls}")
    
    payload = {
        "dicomUrls": dicom_urls
    }
    
    try:
        response = requests.post(API_URL, json=payload, timeout=60)
        response.raise_for_status()
        
        data = response.json()
        
        # Extract nested data if from Express backend
        if 'data' in data:
            actual_data = data['data']
        else:
            actual_data = data
        
        # Print summary
        print_results_summary(actual_data)
        
        # Save heatmaps (handle flat structure for Express, nested for direct FastAPI)
        analysis_data = actual_data
        print("\n💾 Saving Heatmaps...")
        
        # Heatmap is now an array, save the first one (for highest probability model)
        if analysis_data.get('heatmap') and len(analysis_data['heatmap']) > 0:
            decode_and_save_heatmap(analysis_data['heatmap'][0], 'highest_probability_model')
        
        # Save full JSON (without base64)
        clean_data = json.loads(json.dumps(data))
        for model in ['acl', 'meniscus', 'abnormal']:
            if 'diagnosis' in clean_data and model in clean_data['diagnosis']:
                # No heatmap in individual models anymore
                pass
        
        # Clean heatmap array
        if 'heatmap' in clean_data and isinstance(clean_data['heatmap'], list):
            clean_data['heatmap'] = [f"<base64 image data - {len(h)} chars>" for h in clean_data['heatmap']]
        
        os.makedirs("./test_results", exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        json_file = f"./test_results/analysis_{timestamp}.json"
        with open(json_file, 'w') as f:
            json.dump(clean_data, f, indent=2)
        print(f"✅ Saved full response to: {json_file}")
        
        return data
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to Express server at http://localhost:3000")
        print("   Make sure the server is running: cd server && pnpm dev")
        return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_fastapi_endpoint(dicom_urls):
    """Test directly via FastAPI (port 5000)"""
    print("\n🟢 Testing FastAPI Directly (http://localhost:5000/analyze)")
    print(f"📁 DICOM URLs: {dicom_urls}")
    
    payload = {
        "dicomUrls": dicom_urls
    }
    
    try:
        response = requests.post(FASTAPI_URL, json=payload, timeout=60)
        response.raise_for_status()
        
        data = response.json()
        
        # Print summary
        print_results_summary(data)
        
        # Save heatmaps
        print("\n💾 Saving Heatmaps...")
        # Heatmap is now an array, save the first one (for highest probability model)
        if data.get('heatmap') and len(data['heatmap']) > 0:
            decode_and_save_heatmap(data['heatmap'][0], 'highest_probability_model_direct')
        
        # Save full JSON (without base64)
        clean_data = json.loads(json.dumps(data))
        # Clean heatmap array
        if 'heatmap' in clean_data and isinstance(clean_data['heatmap'], list):
            clean_data['heatmap'] = [f"<base64 image data - {len(h)} chars>" for h in clean_data['heatmap']]
        
        os.makedirs("./test_results", exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        json_file = f"./test_results/analysis_{timestamp}_direct.json"
        with open(json_file, 'w') as f:
            json.dump(clean_data, f, indent=2)
        print(f"✅ Saved full response to: {json_file}")
        
        return data
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to FastAPI server at http://localhost:5000")
        print("   Make sure the server is running: cd fast_api && python main.py")
        return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

if __name__ == "__main__":
    print("\n" + "="*80)
    print("🏥 CDSS API TESTING SCRIPT")
    print("="*80)
    
    # Example DICOM URLs - replace with your actual Supabase URLs
    dicom_urls = []
    print("\n📎 Enter 3 DICOM URLs (one per line, or press Enter for examples):")
    
    for i in range(3):
        url = input(f"DICOM URL {i+1}: ").strip()
        if not url:
            url = "https://your-supabase-url.supabase.co/storage/v1/object/public/dicom-bucket/scan123.dcm"
            print(f"Using example URL for slice {i+1}: {url}")
        dicom_urls.append(url)
    
    print(f"\nUsing DICOM URLs: {dicom_urls}")
    
    print("\nWhich endpoint to test?")
    print("1. Express Backend (recommended - tests full pipeline)")
    print("2. FastAPI Direct (tests AI service only)")
    print("3. Both")
    
    choice = input("\nEnter choice (1/2/3) [default: 1]: ").strip() or "1"
    
    if choice in ["1", "3"]:
        test_express_endpoint(dicom_urls)
    
    if choice in ["2", "3"]:
        test_fastapi_endpoint(dicom_urls)
    
    print("\n✨ Testing complete! Check ./test_results/ folder for saved heatmaps and JSON.\n")
