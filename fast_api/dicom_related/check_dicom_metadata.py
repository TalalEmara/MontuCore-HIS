#!/usr/bin/env python3
import pydicom
import requests
from io import BytesIO

# Check the original DICOM
url = 'https://brnitwpxdkwvhlgvfkua.supabase.co/storage/v1/object/public/dicoms/scans/1766255681479_demo_pure_acl_6.dcm'
response = requests.get(url)
if response.status_code == 200:
    ds = pydicom.dcmread(BytesIO(response.content), force=True)
    print('Original DICOM:')
    print(f'  Shape: {ds.pixel_array.shape}')
    print(f'  BitsAllocated: {getattr(ds, "BitsAllocated", "N/A")}')
    print(f'  BitsStored: {getattr(ds, "BitsStored", "N/A")}')
    print(f'  PixelRepresentation: {getattr(ds, "PixelRepresentation", "N/A")}')
    print(f'  PhotometricInterpretation: {getattr(ds, "PhotometricInterpretation", "N/A")}')
    if hasattr(ds, 'file_meta') and ds.file_meta:
        print(f'  TransferSyntaxUID: {getattr(ds.file_meta, "TransferSyntaxUID", "N/A")}')
    else:
        print('  TransferSyntaxUID: No file_meta')
else:
    print('Failed to download original DICOM')

# Check one of the extracted slices
slice_url = 'https://brnitwpxdkwvhlgvfkua.supabase.co/storage/v1/object/public/dicoms/scans/case_7/exam_14_1766851620750/demo_pure_acl_6_1.dcm'
response = requests.get(slice_url)
if response.status_code == 200:
    ds = pydicom.dcmread(BytesIO(response.content), force=True)
    print('\nExtracted slice DICOM:')
    print(f'  Shape: {ds.pixel_array.shape}')
    print(f'  BitsAllocated: {getattr(ds, "BitsAllocated", "N/A")}')
    print(f'  BitsStored: {getattr(ds, "BitsStored", "N/A")}')
    print(f'  PixelRepresentation: {getattr(ds, "PixelRepresentation", "N/A")}')
    print(f'  PhotometricInterpretation: {getattr(ds, "PhotometricInterpretation", "N/A")}')
    if hasattr(ds, 'file_meta') and ds.file_meta:
        print(f'  TransferSyntaxUID: {getattr(ds.file_meta, "TransferSyntaxUID", "N/A")}')
    else:
        print('  TransferSyntaxUID: No file_meta')
else:
    print('Failed to download extracted slice')