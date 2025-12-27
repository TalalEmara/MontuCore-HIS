import requests
import json

# Test Express endpoint
url = 'http://localhost:3000/api/cdss/analyze-dicom'
payload = {
    'dicomUrls': [
        'https://brnitwpxdkwvhlgvfkua.supabase.co/storage/v1/object/public/dicoms/scans/case_7/exam_16_1766852130866/demo_pure_acl_6_1.dcm',
        'https://brnitwpxdkwvhlgvfkua.supabase.co/storage/v1/object/public/dicoms/scans/case_7/exam_16_1766852130866/demo_pure_acl_6_2.dcm',
        'https://brnitwpxdkwvhlgvfkua.supabase.co/storage/v1/object/public/dicoms/scans/case_7/exam_16_1766852130866/demo_pure_acl_6_3.dcm'
    ]
}

try:
    response = requests.post(url, json=payload, timeout=60)
    data = response.json()
    print('Response Keys:', sorted(data.keys()))
    print('Success:', data.get('success'))
    if 'error' in data:
        print('Error:', data.get('error'))
        if 'code' in data:
            print('Error Code:', data.get('code'))
    print('Has diagnosis object:', 'diagnosis' in data)
    if 'diagnosis' in data:
        diagnosis_data = data['diagnosis']
        print('Diagnosis keys:', list(diagnosis_data.keys()) if diagnosis_data else 'Empty')
        if diagnosis_data:
            for key, value in diagnosis_data.items():
                print(f'  {key}: {value}')
    print('Has heatmap:', 'heatmap' in data)
    print('Abnormal detected:', data.get('abnormal_detected'))
    print('Threshold:', data.get('threshold'))
    if 'diagnosis' in data and 'primary' in data:
        print('Diagnosis info:', data['diagnosis'])
except Exception as e:
    print('Error:', e)