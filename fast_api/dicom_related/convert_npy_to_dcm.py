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

    # 2. Check Data Range and Scale Properly
    # MRNet .npy is usually 0-255. If it's 0-1 (float), scale to 0-4095 (12-bit)
    if pixel_array.max() <= 1.0:
        pixel_array = (pixel_array * 4095.0).astype(np.uint16)
    elif pixel_array.max() <= 255.0:
        # Assume 8-bit, scale to 12-bit range
        pixel_array = (pixel_array * (4095.0 / 255.0)).astype(np.uint16)
    else:
        pixel_array = pixel_array.astype(np.uint16)

    # 3. Create DICOM from scratch (better than using test file)
    ds = pydicom.Dataset()

    # Required DICOM attributes
    ds.SOPClassUID = '1.2.840.10008.5.1.4.1.1.4'  # MR Image Storage (corrected for MR modality)
    ds.SOPInstanceUID = pydicom.uid.generate_uid()
    ds.StudyInstanceUID = pydicom.uid.generate_uid()
    ds.SeriesInstanceUID = pydicom.uid.generate_uid()
    ds.FrameOfReferenceUID = pydicom.uid.generate_uid()

    # Patient Information
    ds.PatientName = f"Emma Wilson_{patient_id}"
    ds.PatientID = patient_id

    # Study Information
    ds.StudyDate = datetime.datetime.now().strftime('%Y%m%d')
    ds.StudyTime = datetime.datetime.now().strftime('%H%M%S')
    ds.AccessionNumber = ""
    ds.StudyDescription = "Knee MRI CDSS Demo"

    # Series Information
    ds.SeriesNumber = "1"
    ds.SeriesDescription = "Knee MRI CDSS Demo"
    ds.Modality = "MR"
    ds.BodyPartExamined = "KNEE"

    # Image Information
    ds.InstanceNumber = "1"
    ds.ImageType = ['ORIGINAL', 'PRIMARY', 'AXIAL']

    # 4. HANDLE PIXEL DATA CORRECTLY
    if len(pixel_array.shape) == 3:
        # Multi-frame DICOM
        num_frames, rows, cols = pixel_array.shape
        ds.NumberOfFrames = str(num_frames)
        ds.Rows = rows
        ds.Columns = cols

        # For multi-frame, pixel data should be frame1 + frame2 + ... concatenated
        # Each frame should be rows*cols pixels
        pixel_data = pixel_array.tobytes()

    else:
        # Single-frame DICOM
        rows, cols = pixel_array.shape
        ds.Rows = rows
        ds.Columns = cols
        pixel_data = pixel_array.tobytes()

    # Create file dataset (proper DICOM file structure)
    file_meta = pydicom.Dataset()
    file_meta.MediaStorageSOPClassUID = '1.2.840.10008.5.1.4.1.1.4'  # MR Image Storage
    file_meta.MediaStorageSOPInstanceUID = pydicom.uid.generate_uid()
    file_meta.ImplementationClassUID = pydicom.uid.generate_uid()
    # Use Explicit VR Little Endian for better Cornerstone.js compatibility
    file_meta.TransferSyntaxUID = '1.2.840.10008.1.2.1'  # Explicit VR Little Endian

    # Create FileDataset with proper structure
    ds = FileDataset(output_name, {}, file_meta=file_meta, preamble=b"\x00" * 128)

    # Set all the dataset attributes
    ds.SOPClassUID = file_meta.MediaStorageSOPClassUID
    ds.SOPInstanceUID = file_meta.MediaStorageSOPInstanceUID
    ds.StudyInstanceUID = pydicom.uid.generate_uid()
    ds.SeriesInstanceUID = pydicom.uid.generate_uid()
    ds.FrameOfReferenceUID = pydicom.uid.generate_uid()

    # Patient Information
    ds.PatientName = f"Emma Wilson_{patient_id}"
    ds.PatientID = patient_id

    # Study Information
    ds.StudyDate = datetime.datetime.now().strftime('%Y%m%d')
    ds.StudyTime = datetime.datetime.now().strftime('%H%M%S')
    ds.AccessionNumber = ""
    ds.StudyDescription = "Knee MRI CDSS Demo"

    # Series Information
    ds.SeriesNumber = "1"
    ds.SeriesDescription = "Knee MRI CDSS Demo"
    ds.Modality = "MR"
    ds.BodyPartExamined = "KNEE"

    # Image Information
    ds.InstanceNumber = "1"
    ds.ImageType = ['ORIGINAL', 'PRIMARY', 'AXIAL']

    # Set pixel data attributes BEFORE setting pixel data
    ds.BitsAllocated = 16
    ds.BitsStored = 12
    ds.HighBit = 11
    ds.PixelRepresentation = 0  # Unsigned integer
    ds.SamplesPerPixel = 1
    ds.PhotometricInterpretation = "MONOCHROME2"

    # Set dimensions and pixel data
    if len(pixel_array.shape) == 3:
        # Multi-frame DICOM - Cornerstone.js compatible
        num_frames, rows, cols = pixel_array.shape
        ds.NumberOfFrames = str(num_frames)
        ds.Rows = rows
        ds.Columns = cols

        # Add slice spacing information for better Cornerstone.js compatibility
        ds.SliceThickness = "3.0"  # 3mm slice thickness
        ds.SpacingBetweenSlices = "3.0"  # 3mm spacing

        # Add basic slice position information
        ds.ImagePositionPatient = ['0.0', '0.0', '0.0']
        ds.ImageOrientationPatient = ['1.0', '0.0', '0.0', '0.0', '1.0', '0.0']

        ds.PixelData = pixel_array.tobytes()
    else:
        # Single-frame DICOM
        rows, cols = pixel_array.shape
        ds.Rows = rows
        ds.Columns = cols
        ds.PixelData = pixel_array.tobytes()

    # Additional MR-specific attributes
    ds.RescaleIntercept = "0"
    ds.RescaleSlope = "1"
    ds.RescaleType = "US"

    # Save with explicit VR encoding
    ds.is_little_endian = True
    ds.is_implicit_VR = False  # Explicit VR for better compatibility

    # Save the file
    ds.save_as(output_name)

    print(f"✅ Created DICOM: {output_name}")
    print(f"   Frames: {getattr(ds, 'NumberOfFrames', '1')}")
    print(f"   Dimensions: {ds.Rows}x{ds.Columns}")
    print(f"   Pixel Range: {pixel_array.min()}-{pixel_array.max()}")

# --- USAGE ---
# Use the .npy file that gave you 86% in the Kaggle notebook
img_path = "D:/Eng/SBE/4th/hcis/MontuCore-HIS/dicom_images/demo_pure_acl_1177_Abn68_Acl86_Men16.npy"
output_path = "D:/Eng/SBE/4th/hcis/MontuCore-HIS/dicom_images/demo_pure_acl_1177_Abn68_Acl86_Men16.dcm"

create_dicom(img_path, output_path, "6")