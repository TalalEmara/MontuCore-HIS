import pydicom
from pydicom.dataset import FileDataset
import numpy as np
from PIL import Image
import os
import datetime

def create_dicom(image_path, output_name, patient_id="6"):
    # 1. Load Data
    if image_path.endswith('.npy'):
        pixel_array = np.load(image_path)  # Shape: (Slices, 256, 256)
    else:
        # Fallback for PNG (creates a single slice DICOM)
        img = Image.open(image_path).convert('L')
        pixel_array = np.array(img)

    # 2. Check Data Range (Prevent Black Images)
    # MRNet .npy is usually 0-255. If it's 0-1 (float), we must scale it.
    if pixel_array.max() <= 1.0:
        pixel_array = (pixel_array * 255.0)

    pixel_array = pixel_array.astype(np.uint16)

    # 3. Create DICOM Metadata
    filename = pydicom.data.get_testdata_file("CT_small.dcm")
    ds = pydicom.dcmread(filename)
    
    ds.PatientName = f"Emma Wilson_{patient_id}"
    ds.PatientID = patient_id
    ds.Modality = "MR"
    ds.BodyPartExamined = "KNEE"
    ds.SeriesDescription = "Knee MRI CDSS Demo"
    ds.StudyDate = datetime.datetime.now().strftime('%Y%m%d')

    # 4. HANDLE 3D VOLUME (The Fix)
    if len(pixel_array.shape) == 3:
        # Multi-frame DICOM
        ds.NumberOfFrames = pixel_array.shape[0]
        ds.Rows = pixel_array.shape[1]
        ds.Columns = pixel_array.shape[2]
    else:
        # Single-frame DICOM
        ds.Rows = pixel_array.shape[0]
        ds.Columns = pixel_array.shape[1]

    # 5. Save Pixel Data
    # pydicom expects bytes. 
    # For 3D, it expects (Frame1, Frame2, ...) concatenated sequentially.
    ds.PixelData = pixel_array.tobytes()
    
    # Save
    ds.save_as(output_name)
    print(f"✅ Created 3D DICOM: {output_name} (Frames: {getattr(ds, 'NumberOfFrames', 1)})")

# --- USAGE ---
# Use the .npy file that gave you 86% in the Kaggle notebook
img_path = "D:/Eng/SBE/4th/hcis/MontuCore-HIS/dicom_images/demo_pure_acl_1177_Abn68_Acl86_Men16.npy"
output_path = "D:/Eng/SBE/4th/hcis/MontuCore-HIS/dicom_images/demo_pure_acl_6.dcm"

create_dicom(img_path, output_path, "6")