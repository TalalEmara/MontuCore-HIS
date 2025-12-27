#!/usr/bin/env python3
"""
DICOM Slice Extractor
Extracts 3 middle slices from a 3D DICOM file and saves them as individual 2D DICOM files.
"""

import pydicom
import numpy as np
import os
import sys
import argparse

def extract_middle_slices(dicom_path, output_prefix=None):
    """Extract 3 middle slices from a 3D DICOM file."""

    # Validate input
    if not os.path.exists(dicom_path):
        print(f"❌ Error: File not found: {dicom_path}")
        return

    # Set output prefix
    if output_prefix is None:
        output_prefix = os.path.splitext(os.path.basename(dicom_path))[0]

    print(f"📂 Processing: {dicom_path}")
    print(f"📝 Output prefix: {output_prefix}")

    try:
        # Read DICOM
        ds = pydicom.dcmread(dicom_path, force=True)
        pixel_array = ds.pixel_array

        print(f"✅ Loaded DICOM: {pixel_array.shape}")

        if len(pixel_array.shape) != 3:
            print(f"❌ Error: Expected 3D DICOM, got {len(pixel_array.shape)}D")
            return

        num_slices = pixel_array.shape[0]
        if num_slices < 3:
            print(f"❌ Error: Need at least 3 slices, got {num_slices}")
            return

        # Get middle 3 slices
        mid = num_slices // 2
        indices = [max(0, mid-1), mid, min(num_slices-1, mid+1)]

        print(f"🎯 Extracting slices: {indices}")

        # Save each slice
        for i, idx in enumerate(indices):
            slice_data = pixel_array[idx]

            # Create a completely new DICOM dataset for the 2D slice
            slice_ds = pydicom.Dataset()

            # Copy essential metadata from original
            slice_ds.PatientName = getattr(ds, 'PatientName', '')
            slice_ds.PatientID = getattr(ds, 'PatientID', '')
            slice_ds.StudyInstanceUID = getattr(ds, 'StudyInstanceUID', pydicom.uid.generate_uid())
            slice_ds.SeriesInstanceUID = pydicom.uid.generate_uid()
            slice_ds.SOPInstanceUID = pydicom.uid.generate_uid()
            slice_ds.SOPClassUID = '1.2.840.10008.5.1.4.1.1.2'  # CT Image Storage
            slice_ds.Modality = getattr(ds, 'Modality', 'CT')
            slice_ds.SeriesDescription = f"Extracted slice {i+1} from middle slices"
            slice_ds.InstanceNumber = i + 1

            # Image dimensions - CRITICAL for 2D
            slice_ds.Rows = slice_data.shape[0]
            slice_ds.Columns = slice_data.shape[1]
            slice_ds.BitsAllocated = 16
            slice_ds.BitsStored = 16
            slice_ds.HighBit = 15
            slice_ds.PixelRepresentation = 0  # unsigned
            slice_ds.SamplesPerPixel = 1
            slice_ds.PhotometricInterpretation = 'MONOCHROME2'

            # Pixel data
            slice_ds.PixelData = slice_data.astype(np.uint16).tobytes()

            # File meta information - CRITICAL
            file_meta = pydicom.Dataset()
            file_meta.MediaStorageSOPClassUID = '1.2.840.10008.5.1.4.1.1.2'
            file_meta.MediaStorageSOPInstanceUID = slice_ds.SOPInstanceUID
            file_meta.ImplementationClassUID = pydicom.uid.generate_uid()
            file_meta.TransferSyntaxUID = '1.2.840.10008.1.2'  # Implicit VR Little Endian
            slice_ds.file_meta = file_meta

            # Save with explicit transfer syntax
            output_file = f"{output_prefix}_{i+1}.dcm"
            slice_ds.save_as(output_file, write_like_original=False)
            print(f"✅ Saved: {output_file} (shape: {slice_data.shape})")

        print("🎉 Done!")

    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    parser = argparse.ArgumentParser(description="Extract 3 middle slices from DICOM")
    parser.add_argument("input_file", help="Input DICOM file")
    parser.add_argument("output_prefix", nargs="?", help="Output prefix (optional)")

    args = parser.parse_args()
    extract_middle_slices(args.input_file, args.output_prefix)

if __name__ == "__main__":
    main()