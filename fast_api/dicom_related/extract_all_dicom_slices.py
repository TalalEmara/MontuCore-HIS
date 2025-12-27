#!/usr/bin/env python3
"""
DICOM All Slices Extractor
Extracts all slices from a 3D DICOM file and saves them as individual 2D DICOM files.
"""

import pydicom
import numpy as np
import os
import sys
import argparse

def extract_all_slices(dicom_path, output_prefix=None):
    """Extract all slices from a 3D DICOM file."""

    # Validate input
    if not os.path.exists(dicom_path):
        print(f"❌ Error: File not found: {dicom_path}")
        return

    # Set output prefix
    if output_prefix is None:
        output_prefix = os.path.splitext(os.path.basename(dicom_path))[0]

    # Create output directory named after the input file (without extension)
    output_dir = output_prefix
    os.makedirs(output_dir, exist_ok=True)

    print(f"📂 Processing: {dicom_path}")
    print(f"📁 Output directory: {output_dir}")

    try:
        # Read DICOM
        ds = pydicom.dcmread(dicom_path, force=True)
        pixel_array = ds.pixel_array

        print(f"✅ Loaded DICOM: {pixel_array.shape}")

        if len(pixel_array.shape) != 3:
            print(f"❌ Error: Expected 3D DICOM, got {len(pixel_array.shape)}D")
            return

        num_slices = pixel_array.shape[0]

        print(f"🎯 Extracting all {num_slices} slices")

        # Generate a new SeriesInstanceUID for the extracted slices
        series_uid = pydicom.uid.generate_uid()

        # Save each slice
        for idx in range(num_slices):
            slice_data = pixel_array[idx]

            # Create a completely new DICOM dataset for the 2D slice
            slice_ds = pydicom.Dataset()

            # Copy essential metadata from original
            slice_ds.PatientName = getattr(ds, 'PatientName', '')
            slice_ds.PatientID = getattr(ds, 'PatientID', '')
            slice_ds.StudyInstanceUID = getattr(ds, 'StudyInstanceUID', pydicom.uid.generate_uid())
            slice_ds.SeriesInstanceUID = series_uid
            slice_ds.SOPInstanceUID = pydicom.uid.generate_uid()
            slice_ds.SOPClassUID = getattr(ds, 'SOPClassUID', '1.2.840.10008.5.1.4.1.1.4')  # Copy or default to MR
            slice_ds.Modality = getattr(ds, 'Modality', 'MR')
            slice_ds.SeriesDescription = f"Extracted slice {idx+1} from all slices"
            slice_ds.InstanceNumber = idx + 1

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
            file_meta.MediaStorageSOPClassUID = slice_ds.SOPClassUID
            file_meta.MediaStorageSOPInstanceUID = slice_ds.SOPInstanceUID
            file_meta.ImplementationClassUID = pydicom.uid.generate_uid()
            file_meta.TransferSyntaxUID = '1.2.840.10008.1.2.1'  # Explicit VR Little Endian
            slice_ds.file_meta = file_meta

            # Save with explicit transfer syntax
            output_file = os.path.join(output_dir, f"slice_{idx+1}.dcm")
            slice_ds.save_as(output_file, write_like_original=False)
            print(f"✅ Saved: {output_file} (shape: {slice_data.shape})")

        print("🎉 Done!")

    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    parser = argparse.ArgumentParser(description="Extract all slices from DICOM")
    parser.add_argument("input_file", help="Input DICOM file")
    parser.add_argument("output_prefix", nargs="?", help="Output prefix (optional)")

    args = parser.parse_args()
    extract_all_slices(args.input_file, args.output_prefix)

if __name__ == "__main__":
    main()