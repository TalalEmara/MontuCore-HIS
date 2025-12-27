# DICOM Slice Extractor

This script extracts 3 middle slices from a 3D DICOM file and saves them as individual 2D DICOM files.

## Usage

```bash
python extract_dicom_slices.py <input_dicom_file> [output_prefix]
```

## Examples

```bash
# Extract slices with default naming
python extract_dicom_slices.py knee_mri.dcm

# Extract slices with custom prefix
python extract_dicom_slices.py knee_mri.dcm patient_001_slice
```

## Output

The script creates 3 files:
- `{prefix}_1.dcm` - First middle slice
- `{prefix}_2.dcm` - Middle slice
- `{prefix}_3.dcm` - Last middle slice

## Requirements

- pydicom
- numpy

## Notes

- Input must be a 3D DICOM file (multi-slice volume)
- Output slices are valid 2D DICOM files that can be uploaded to Supabase
- Perfect for preparing test data for the CDSS system that expects 3 separate sagittal slices