import pydicom
from pydicom.dataset import FileDataset
import numpy as np
from PIL import Image
import os
import datetime

def create_dicom(image_path, output_name, patient_id="12345"):
    # 1. Load Image (PNG or NPY)
    if image_path.endswith('.npy'):
        pixel_array = np.load(image_path)
        # If 3D volume, take middle slice for simple viewer demo
        if len(pixel_array.shape) == 3:
            pixel_array = pixel_array[pixel_array.shape[0] // 2]
    else:
        # Load PNG/JPG and convert to Gray
        img = Image.open(image_path).convert('L') # L = Grayscale
        pixel_array = np.array(img)

    # 2. Create standard DICOM metadata
    # (Boilerplate to make Cornerstone happy)
    filename = pydicom.data.get_testdata_file("CT_small.dcm")
    ds = pydicom.dcmread(filename)
    
    ds.PatientName = f"Test^Patient^{patient_id}"
    ds.PatientID = patient_id
    ds.Modality = "MR"
    ds.SeriesDescription = "Knee MRI"
    ds.StudyDate = datetime.datetime.now().strftime('%Y%m%d')
    
    # 3. Insert Pixel Data
    ds.Rows = pixel_array.shape[0]
    ds.Columns = pixel_array.shape[1]
    ds.PixelData = pixel_array.astype(np.uint16).tobytes()
    
    # Save
    ds.save_as(output_name)
    print(f"✅ Created {output_name}")

# Usage:
# create_dicom("demo_acl_1130.png", "patient_1130.dcm", "1130")