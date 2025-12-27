#!/usr/bin/env python3
"""
Create a mock 3D DICOM file for testing the slice extractor.
"""

import pydicom
import numpy as np
import os

def create_mock_3d_dicom(filename, num_slices=10, height=256, width=256):
    """Create a mock 3D DICOM file with random data."""

    # Create random 3D volume
    volume = np.random.randint(0, 4096, (num_slices, height, width), dtype=np.uint16)

    # Create a basic DICOM dataset
    ds = pydicom.Dataset()

    # File meta information
    file_meta = pydicom.Dataset()
    file_meta.MediaStorageSOPClassUID = '1.2.840.10008.5.1.4.1.1.2'
    file_meta.MediaStorageSOPInstanceUID = pydicom.uid.generate_uid()
    file_meta.ImplementationClassUID = pydicom.uid.generate_uid()
    file_meta.TransferSyntaxUID = '1.2.840.10008.1.2'  # Implicit VR Little Endian

    ds.file_meta = file_meta

    # Required DICOM tags
    ds.ImageType = ['ORIGINAL', 'PRIMARY']
    ds.SOPClassUID = '1.2.840.10008.5.1.4.1.1.2'  # CT Image Storage
    ds.SOPInstanceUID = pydicom.uid.generate_uid()
    ds.StudyInstanceUID = pydicom.uid.generate_uid()
    ds.SeriesInstanceUID = pydicom.uid.generate_uid()
    ds.Modality = 'CT'
    ds.SeriesDescription = 'Mock 3D DICOM for testing'
    ds.StudyDescription = 'CDSS Testing Study'

    # Image dimensions
    ds.Rows = height
    ds.Columns = width
    ds.BitsAllocated = 16
    ds.BitsStored = 16
    ds.HighBit = 15
    ds.PixelRepresentation = 0  # unsigned
    ds.SamplesPerPixel = 1
    ds.PhotometricInterpretation = 'MONOCHROME2'

    # Pixel data
    ds.PixelData = volume.tobytes()

    # Save with proper preamble
    ds.save_as(filename, write_like_original=False)
    print(f"✅ Created mock 3D DICOM: {filename}")
    print(f"   Shape: {volume.shape}")
    print(f"   Size: {os.path.getsize(filename)} bytes")

if __name__ == "__main__":
    create_mock_3d_dicom("test_3d_dicom.dcm", num_slices=8)