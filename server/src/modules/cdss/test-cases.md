# CDSS Test Cases

## 🫀 Cardiac Test Cases

### 1. Severe LV Hypertrophy (Critical)
```json
{
  "athlete": {
    "name": "John Doe",
    "age": 28,
    "sport": "weightlifting"
  },
  "imaging": {
    "type": "cardiac",
    "findings": "Severe left ventricular wall thickening observed",
    "severity": "high",
    "cardiacFindings": {
      "lvThickness": 18,
      "ejectionFraction": 60
    }
  }
}
```
**Expected**: High severity alert, 0 weeks (indefinite restriction), urgent cardiology referral

### 2. Athlete's Heart (Physiological)
```json
{
  "athlete": {
    "name": "Sarah Runner",
    "age": 24,
    "sport": "running"
  },
  "imaging": {
    "type": "cardiac",
    "findings": "Moderate left ventricular hypertrophy 14mm",
    "severity": "low",
    "cardiacFindings": {
      "lvThickness": 14,
      "ejectionFraction": 65
    }
  }
}
```
**Expected**: Low severity, 0 weeks, physiological finding with follow-up recommendation

### 3. Reduced Ejection Fraction
```json
{
  "athlete": {
    "name": "Mike Johnson",
    "age": 35,
    "sport": "soccer"
  },
  "imaging": {
    "type": "cardiac",
    "findings": "Reduced ejection fraction detected on echo",
    "severity": "high",
    "cardiacFindings": {
      "ejectionFraction": 45,
      "lvThickness": 11
    }
  }
}
```
**Expected**: High severity, 12 weeks restriction, urgent cardiology referral

### 4. Cardiac Arrhythmia
```json
{
  "athlete": {
    "name": "Tom Williams",
    "age": 30,
    "sport": "basketball"
  },
  "imaging": {
    "type": "cardiac",
    "findings": "Irregular rhythm detected",
    "severity": "high",
    "cardiacFindings": {
      "rhythmIssues": ["Atrial Fibrillation", "PVCs"],
      "ejectionFraction": 55
    }
  }
}
```
**Expected**: High severity, 8 weeks, immediate cardiology referral

### 5. Valve Abnormalities
```json
{
  "athlete": {
    "name": "Lisa Chen",
    "age": 27,
    "sport": "tennis"
  },
  "imaging": {
    "type": "cardiac",
    "findings": "Mitral valve regurgitation noted",
    "severity": "medium",
    "cardiacFindings": {
      "valveAbnormalities": ["Mitral Regurgitation"],
      "ejectionFraction": 58
    }
  }
}
```
**Expected**: Medium severity, 6 weeks, cardiology evaluation required

---

## 🦴 Musculoskeletal Test Cases

### 6. Complete ACL Tear (Young Athlete)
```json
{
  "athlete": {
    "name": "David Martinez",
    "age": 22,
    "sport": "soccer"
  },
  "imaging": {
    "type": "musculoskeletal",
    "findings": "Complete anterior cruciate ligament tear",
    "severity": "high",
    "musculoskeletalFindings": {
      "injuryType": "ligament",
      "location": "ACL",
      "grade": "3"
    }
  }
}
```
**Expected**: High severity, ~29 weeks (36 * 0.8 age factor), ACL reconstruction required

### 7. Partial MCL Sprain
```json
{
  "athlete": {
    "name": "Emma Wilson",
    "age": 26,
    "sport": "volleyball"
  },
  "imaging": {
    "type": "musculoskeletal",
    "findings": "Grade 2 MCL sprain of the left knee",
    "severity": "medium",
    "musculoskeletalFindings": {
      "injuryType": "ligament",
      "location": "MCL",
      "grade": "2"
    }
  }
}
```
**Expected**: Medium severity, 8 weeks, physical therapy and bracing

### 8. High-Risk Stress Fracture (Older Athlete)
```json
{
  "athlete": {
    "name": "Robert Brown",
    "age": 38,
    "sport": "running"
  },
  "imaging": {
    "type": "musculoskeletal",
    "findings": "Stress fracture of femoral neck detected",
    "severity": "high",
    "musculoskeletalFindings": {
      "injuryType": "bone",
      "location": "femoral neck",
      "fractureType": "stress"
    }
  }
}
```
**Expected**: High severity, ~14 weeks (12 * 1.2 age factor), non-weight bearing protocol

### 9. Low-Risk Stress Fracture
```json
{
  "athlete": {
    "name": "Anna Lee",
    "age": 25,
    "sport": "running"
  },
  "imaging": {
    "type": "musculoskeletal",
    "findings": "Stress fracture of third metatarsal",
    "severity": "medium",
    "musculoskeletalFindings": {
      "injuryType": "bone",
      "location": "third metatarsal",
      "fractureType": "stress"
    }
  }
}
```
**Expected**: Medium severity, 8 weeks, reduce training 50%

### 10. Complete Muscle Rupture
```json
{
  "athlete": {
    "name": "Carlos Rodriguez",
    "age": 29,
    "sport": "soccer"
  },
  "imaging": {
    "type": "musculoskeletal",
    "findings": "Complete hamstring rupture",
    "severity": "high",
    "musculoskeletalFindings": {
      "injuryType": "muscle",
      "location": "hamstring",
      "grade": "3"
    }
  }
}
```
**Expected**: High severity, 12 weeks, surgical evaluation required

### 11. Cartilage Damage
```json
{
  "athlete": {
    "name": "Jessica Taylor",
    "age": 31,
    "sport": "basketball"
  },
  "imaging": {
    "type": "musculoskeletal",
    "findings": "Articular cartilage damage in knee",
    "severity": "medium",
    "musculoskeletalFindings": {
      "injuryType": "cartilage",
      "location": "knee joint"
    }
  }
}
```
**Expected**: Medium severity, 8 weeks, may require arthroscopy

### 12. Acute Fracture
```json
{
  "athlete": {
    "name": "Kevin Park",
    "age": 27,
    "sport": "hockey"
  },
  "imaging": {
    "type": "musculoskeletal",
    "findings": "Acute fracture of the radius",
    "severity": "high",
    "musculoskeletalFindings": {
      "injuryType": "bone",
      "location": "radius",
      "fractureType": "acute"
    }
  }
}
```
**Expected**: High severity, 16 weeks, immediate orthopedic consultation

---

## 🧠 Neurological Test Cases

### 13. First-Time Concussion (Non-Contact Sport)
```json
{
  "athlete": {
    "name": "Sophie Anderson",
    "age": 23,
    "sport": "cycling"
  },
  "imaging": {
    "type": "neurological",
    "findings": "Mild traumatic brain injury",
    "severity": "medium",
    "neurologicalFindings": {
      "traumaType": "concussion",
      "priorConcussions": 0,
      "glascowScore": 15
    }
  }
}
```
**Expected**: Medium severity, 4 weeks, gradual return-to-play protocol

### 14. Multiple Concussions (Contact Sport)
```json
{
  "athlete": {
    "name": "Jake Miller",
    "age": 26,
    "sport": "football"
  },
  "imaging": {
    "type": "neurological",
    "findings": "Fourth concussion in career",
    "severity": "high",
    "neurologicalFindings": {
      "traumaType": "concussion",
      "priorConcussions": 3,
      "glascowScore": 14
    }
  }
}
```
**Expected**: High severity, 12 weeks (6 base + 6 for prior), consider retirement recommendation

### 15. Intracranial Hemorrhage
```json
{
  "athlete": {
    "name": "Marcus Jones",
    "age": 29,
    "sport": "boxing"
  },
  "imaging": {
    "type": "neurological",
    "findings": "Subdural hemorrhage detected",
    "severity": "high",
    "neurologicalFindings": {
      "traumaType": "hemorrhage",
      "location": "subdural",
      "glascowScore": 13
    }
  }
}
```
**Expected**: High severity, 16 weeks minimum, urgent neurosurgery consultation

### 16. Structural Brain Abnormality
```json
{
  "athlete": {
    "name": "Rachel White",
    "age": 25,
    "sport": "rugby"
  },
  "imaging": {
    "type": "neurological",
    "findings": "Cerebral cyst identified",
    "severity": "high",
    "neurologicalFindings": {
      "traumaType": "structural",
      "location": "frontal lobe"
    }
  }
}
```
**Expected**: High severity, 0 weeks (indefinite), NO contact sports until cleared

### 17. Decreased Glasgow Score
```json
{
  "athlete": {
    "name": "Brandon Scott",
    "age": 30,
    "sport": "mma"
  },
  "imaging": {
    "type": "neurological",
    "findings": "Altered mental status post-fight",
    "severity": "high",
    "neurologicalFindings": {
      "traumaType": "concussion",
      "priorConcussions": 1,
      "glascowScore": 12
    }
  }
}
```
**Expected**: Multiple alerts including decreased consciousness, extended recovery

---

## 🔀 Mixed/Edge Cases

### 18. Text-Only Analysis (No Structured Data)
```json
{
  "athlete": {
    "name": "Alex Kim",
    "age": 28,
    "sport": "tennis"
  },
  "imaging": {
    "type": "musculoskeletal",
    "findings": "ACL tear with meniscus damage",
    "severity": "high"
  }
}
```
**Expected**: Falls back to text-based analysis, detects ACL tear from text

### 19. Combined Structured + Text Analysis
```json
{
  "athlete": {
    "name": "Maria Garcia",
    "age": 24,
    "sport": "basketball"
  },
  "imaging": {
    "type": "cardiac",
    "findings": "Hypertrophic cardiomyopathy 16mm with arrhythmia",
    "severity": "high",
    "cardiacFindings": {
      "lvThickness": 16,
      "rhythmIssues": ["SVT"]
    }
  }
}
```
**Expected**: Multiple alerts from both structured and text analysis

### 20. Young Athlete Fast Recovery
```json
{
  "athlete": {
    "name": "Tyler Young",
    "age": 19,
    "sport": "soccer"
  },
  "imaging": {
    "type": "musculoskeletal",
    "findings": "Grade 2 hamstring strain",
    "severity": "medium",
    "musculoskeletalFindings": {
      "injuryType": "muscle",
      "location": "hamstring",
      "grade": "2"
    }
  }
}
```
**Expected**: ~5 weeks (6 * 0.8 age factor), faster recovery due to young age

---

## 🧪 PowerShell Test Commands

### Test Cardiac (Severe LV Hypertrophy)
```powershell
$body = @{
  athlete=@{name='John Doe';age=28;sport='weightlifting'}
  imaging=@{
    type='cardiac'
    findings='Severe left ventricular wall thickening observed'
    severity='high'
    cardiacFindings=@{
      lvThickness=18
      ejectionFraction=60
    }
  }
} | ConvertTo-Json -Depth 4
Invoke-RestMethod -Uri 'http://localhost:5000/api/cdss/analyze' -Method POST -ContentType 'application/json' -Body $body
```

### Test Musculoskeletal (ACL Tear)
```powershell
$body = @{
  athlete=@{name='David Martinez';age=22;sport='soccer'}
  imaging=@{
    type='musculoskeletal'
    findings='Complete anterior cruciate ligament tear'
    severity='high'
    musculoskeletalFindings=@{
      injuryType='ligament'
      location='ACL'
      grade='3'
    }
  }
} | ConvertTo-Json -Depth 4
Invoke-RestMethod -Uri 'http://localhost:5000/api/cdss/analyze' -Method POST -ContentType 'application/json' -Body $body
```

### Test Neurological (Multiple Concussions)
```powershell
$body = @{
  athlete=@{name='Jake Miller';age=26;sport='football'}
  imaging=@{
    type='neurological'
    findings='Fourth concussion in career'
    severity='high'
    neurologicalFindings=@{
      traumaType='concussion'
      priorConcussions=3
      glascowScore=14
    }
  }
} | ConvertTo-Json -Depth 4
Invoke-RestMethod -Uri 'http://localhost:5000/api/cdss/analyze' -Method POST -ContentType 'application/json' -Body $body
```

### Test High-Risk Stress Fracture (Older Athlete)
```powershell
$body = @{
  athlete=@{name='Robert Brown';age=38;sport='running'}
  imaging=@{
    type='musculoskeletal'
    findings='Stress fracture of femoral neck detected'
    severity='high'
    musculoskeletalFindings=@{
      injuryType='bone'
      location='femoral neck'
      fractureType='stress'
    }
  }
} | ConvertTo-Json -Depth 4
Invoke-RestMethod -Uri 'http://localhost:5000/api/cdss/analyze' -Method POST -ContentType 'application/json' -Body $body
```

### Test Intracranial Hemorrhage
```powershell
$body = @{
  athlete=@{name='Marcus Jones';age=29;sport='boxing'}
  imaging=@{
    type='neurological'
    findings='Subdural hemorrhage detected'
    severity='high'
    neurologicalFindings=@{
      traumaType='hemorrhage'
      location='subdural'
      glascowScore=13
    }
  }
} | ConvertTo-Json -Depth 4
Invoke-RestMethod -Uri 'http://localhost:5000/api/cdss/analyze' -Method POST -ContentType 'application/json' -Body $body
```
