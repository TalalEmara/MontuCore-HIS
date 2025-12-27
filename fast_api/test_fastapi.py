import requests
import json

url = 'http://localhost:5000/analyze'
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
    print('FastAPI Response Keys:', sorted(data.keys()))
    print('Success:', data.get('success'))
    print('Has diagnosis:', 'diagnosis' in data)
    print('Has heatmap:', 'heatmap' in data)
    if 'diagnosis' in data:
        print('Diagnosis keys:', list(data['diagnosis'].keys()) if data['diagnosis'] else 'None')
    if 'heatmap' in data:
        print('Heatmap count:', len(data['heatmap']) if data['heatmap'] else 0)
except Exception as e:
    print('Error:', e)