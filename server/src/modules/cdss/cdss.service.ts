// Simple CDSS Service for Athletes

export interface AthleteData {
  name: string;
  age: number;
  sport: string;
}

export interface ImagingData {
  type: 'cardiac' | 'musculoskeletal' | 'neurological';
  findings: string;
  severity: 'low' | 'medium' | 'high';
}

export interface CDSSAlert {
  severity: 'low' | 'medium' | 'high';
  finding: string;
  recommendation: string;
  returnToPlayWeeks?: number;
}

export interface RiskScore {
  score: number;
  category: 'low' | 'moderate' | 'high';
  canPlay: boolean;
}

/**
 * Enhanced CDSS Analysis with Intelligent Rule-Based Logic
 */
export const analyzeImagingFindings = (athlete: AthleteData, imaging: ImagingData) => {
  const alerts: CDSSAlert[] = [];
  const findingsLower = imaging.findings.toLowerCase();
  
  // Contact sports for stricter rules
  const contactSports = ['football', 'rugby', 'hockey', 'boxing', 'mma'];
  const isContactSport = contactSports.includes(athlete.sport.toLowerCase());
  
  // Age-based recovery adjustment (younger athletes recover ~20% faster)
  const ageFactor = athlete.age < 25 ? 0.8 : athlete.age > 35 ? 1.2 : 1.0;

  // ============ MUSCULOSKELETAL RULES ============
  if (imaging.type === 'musculoskeletal') {
    
    // ACL Tear
    if (findingsLower.includes('acl') && (findingsLower.includes('tear') || findingsLower.includes('rupture'))) {
      const weeks = Math.round(36 * ageFactor); // 9 months base
      alerts.push({
        severity: 'high',
        finding: imaging.findings,
        recommendation: 'Complete ACL reconstruction required. Refer to orthopedic surgeon immediately. Post-op rehab protocol essential.',
        returnToPlayWeeks: weeks
      });
    }
    
    // Stress Fractures (location-specific)
    else if (findingsLower.includes('stress fracture')) {
      const highRiskSites = ['femoral neck', 'navicular', 'fifth metatarsal', 'tibia'];
      const isHighRisk = highRiskSites.some(site => findingsLower.includes(site));
      const weeks = isHighRisk ? Math.round(12 * ageFactor) : Math.round(8 * ageFactor);
      
      alerts.push({
        severity: isHighRisk ? 'high' : 'medium',
        finding: imaging.findings,
        recommendation: isHighRisk 
          ? 'High-risk stress fracture. Non-weight bearing for 8-12 weeks. Orthopedic referral required.'
          : 'Low-risk stress fracture. Reduce training load 50%. Cross-training allowed. Repeat imaging in 6 weeks.',
        returnToPlayWeeks: weeks
      });
    }
    
    // MCL/LCL Sprains
    else if (findingsLower.includes('mcl') || findingsLower.includes('lcl')) {
      const isComplete = findingsLower.includes('complete') || findingsLower.includes('grade 3');
      const weeks = isComplete ? Math.round(12 * ageFactor) : Math.round(6 * ageFactor);
      
      alerts.push({
        severity: isComplete ? 'high' : 'medium',
        finding: imaging.findings,
        recommendation: isComplete
          ? 'Complete ligament tear. Consider surgical consultation. 12+ weeks recovery expected.'
          : 'Partial ligament sprain. Brace for 4-6 weeks. Physical therapy recommended.',
        returnToPlayWeeks: weeks
      });
    }
    
    // Meniscus Tears
    else if (findingsLower.includes('meniscus') && findingsLower.includes('tear')) {
      const weeks = Math.round(8 * ageFactor);
      alerts.push({
        severity: 'medium',
        finding: imaging.findings,
        recommendation: 'Meniscus tear detected. Orthopedic evaluation needed. May require arthroscopic surgery.',
        returnToPlayWeeks: weeks
      });
    }
    
    // Bone Marrow Edema (pre-fracture)
    else if (findingsLower.includes('edema') || findingsLower.includes('bone marrow')) {
      alerts.push({
        severity: 'medium',
        finding: imaging.findings,
        recommendation: 'Early stress reaction detected. Reduce training load immediately. Repeat MRI in 4 weeks to monitor progression.',
        returnToPlayWeeks: 4
      });
    }
    
    // Generic musculoskeletal by severity
    else {
      const weeks = imaging.severity === 'high' ? 12 : imaging.severity === 'medium' ? 6 : 2;
      alerts.push({
        severity: imaging.severity,
        finding: imaging.findings,
        recommendation: imaging.severity === 'high' 
          ? 'Significant musculoskeletal injury. Orthopedic consultation required.'
          : 'Musculoskeletal injury detected. Modified training recommended.',
        returnToPlayWeeks: weeks
      });
    }
  }

  // ============ CARDIAC RULES ============
  else if (imaging.type === 'cardiac') {
    
    // Hypertrophic Cardiomyopathy
    if (findingsLower.includes('hypertrophic') || findingsLower.includes('hypertrophy')) {
      const thickness = findingsLower.match(/(\d+)\s*mm/);
      const isAthleteHeart = athlete.sport === 'cycling' || athlete.sport === 'running' || athlete.sport === 'swimming';
      
      if (thickness && thickness[1] && parseInt(thickness[1]) > 15) {
        alerts.push({
          severity: 'high',
          finding: imaging.findings,
          recommendation: 'URGENT: Severe left ventricular hypertrophy (>15mm). Immediate cardiology referral. NO sports participation until cleared. Rule out HCM.',
          returnToPlayWeeks: 0 // Indefinite until cleared
        });
      } else if (isAthleteHeart) {
        alerts.push({
          severity: 'low',
          finding: imaging.findings,
          recommendation: "Mild hypertrophy likely physiological (athlete's heart). ECG and follow-up echo in 6 months recommended.",
          returnToPlayWeeks: 0
        });
      } else {
        alerts.push({
          severity: 'medium',
          finding: imaging.findings,
          recommendation: 'Cardiac hypertrophy detected. Cardiology evaluation required before clearance.',
          returnToPlayWeeks: 4
        });
      }
    }
    
    // Reduced Ejection Fraction
    else if (findingsLower.includes('reduced') && findingsLower.includes('ejection')) {
      alerts.push({
        severity: 'high',
        finding: imaging.findings,
        recommendation: 'Reduced ejection fraction detected. Possible cardiomyopathy. Urgent cardiology referral. Restrict all high-intensity activity.',
        returnToPlayWeeks: 12
      });
    }
    
    // Arrhythmias
    else if (findingsLower.includes('arrhythmia') || findingsLower.includes('afib') || findingsLower.includes('fibrillation')) {
      alerts.push({
        severity: 'high',
        finding: imaging.findings,
        recommendation: 'Cardiac arrhythmia detected. Immediate cardiology referral required. NO sports until evaluated and treated.',
        returnToPlayWeeks: 8
      });
    }
    
    // Generic cardiac by severity
    else {
      const weeks = imaging.severity === 'high' ? 12 : imaging.severity === 'medium' ? 6 : 0;
      alerts.push({
        severity: imaging.severity,
        finding: imaging.findings,
        recommendation: imaging.severity === 'high'
          ? 'Significant cardiac findings. Urgent cardiology referral required.'
          : imaging.severity === 'medium'
          ? 'Cardiac findings require evaluation. Schedule cardiology appointment.'
          : 'Minor cardiac finding. Continue monitoring.',
        returnToPlayWeeks: weeks
      });
    }
  }

  // ============ NEUROLOGICAL RULES ============
  else if (imaging.type === 'neurological') {
    
    // Concussion with complications
    if (findingsLower.includes('concussion') || findingsLower.includes('traumatic brain')) {
      const hasBleeding = findingsLower.includes('bleed') || findingsLower.includes('hemorrhage');
      const weeks = hasBleeding ? 16 : (isContactSport ? 6 : 4);
      
      alerts.push({
        severity: hasBleeding ? 'high' : 'medium',
        finding: imaging.findings,
        recommendation: hasBleeding
          ? 'URGENT: Intracranial bleeding detected. Immediate neurosurgery consultation. NO sports participation.'
          : isContactSport
          ? 'Concussion in contact sport athlete. Strict return-to-play protocol required. Neurology clearance mandatory.'
          : 'Concussion detected. Gradual return-to-play protocol. Symptom-free for 7 days before contact activities.',
        returnToPlayWeeks: weeks
      });
    }
    
    // Structural abnormalities
    else if (findingsLower.includes('lesion') || findingsLower.includes('malformation') || findingsLower.includes('cyst')) {
      alerts.push({
        severity: 'high',
        finding: imaging.findings,
        recommendation: 'Structural brain abnormality detected. Neurology/neurosurgery consultation required. NO contact sports until cleared.',
        returnToPlayWeeks: 0 // Indefinite
      });
    }
    
    // White matter changes
    else if (findingsLower.includes('white matter')) {
      alerts.push({
        severity: 'medium',
        finding: imaging.findings,
        recommendation: 'White matter changes detected. Neurology evaluation recommended. Consider retirement from contact sports if extensive.',
        returnToPlayWeeks: 8
      });
    }
    
    // Generic neurological by severity
    else {
      const weeks = imaging.severity === 'high' ? 12 : imaging.severity === 'medium' ? 6 : 2;
      alerts.push({
        severity: imaging.severity,
        finding: imaging.findings,
        recommendation: imaging.severity === 'high'
          ? 'Significant neurological findings. Neurology consultation required.'
          : 'Neurological findings detected. Follow-up recommended.',
        returnToPlayWeeks: weeks
      });
    }
  }

  // ============ CALCULATE RISK SCORE ============
  let riskScore = 0;
  
  // Base score from severity
  riskScore += imaging.severity === 'high' ? 60 : imaging.severity === 'medium' ? 30 : 10;
  
  // Additional risk factors
  if (imaging.type === 'cardiac') riskScore += 15; // Cardiac = higher risk
  if (imaging.type === 'neurological') riskScore += 10; // Brain injuries = serious
  if (isContactSport && imaging.type === 'neurological') riskScore += 15; // Contact + brain = very serious
  if (athlete.age > 35) riskScore += 10; // Older athletes = slower recovery
  
  // Specific high-risk keywords
  const highRiskKeywords = ['rupture', 'complete tear', 'fracture', 'hemorrhage', 'cardiomyopathy'];
  if (highRiskKeywords.some(keyword => findingsLower.includes(keyword))) {
    riskScore += 20;
  }
  
  riskScore = Math.min(riskScore, 100); // Cap at 100

  const riskCategory: 'low' | 'moderate' | 'high' = 
    riskScore >= 70 ? 'high' : riskScore >= 40 ? 'moderate' : 'low';

  const riskScoreResult: RiskScore = {
    score: riskScore,
    category: riskCategory,
    canPlay: riskScore < 70
  };

  // ============ RETURN TO PLAY ============
  const maxWeeks = Math.max(...alerts.map(a => a.returnToPlayWeeks || 0));
  const returnDate = maxWeeks > 0 
    ? new Date(Date.now() + maxWeeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : null;

  return {
    alerts,
    riskScore: riskScoreResult,
    returnToPlay: {
      weeks: maxWeeks,
      expectedDate: returnDate,
      status: maxWeeks === 0 ? 'Cleared' : maxWeeks > 12 ? 'Long-term Restriction' : 'Restricted'
    }
  };
};

/**
 * Get sport-specific common injuries
 */
export const getSportRisks = (sport: string) => {
  const risks: Record<string, string[]> = {
    'soccer': ['ACL tears', 'ankle sprains', 'concussions'],
    'basketball': ['ACL tears', 'ankle sprains', 'knee injuries'],
    'football': ['concussions', 'shoulder injuries', 'ACL tears'],
    'running': ['stress fractures', 'shin splints'],
    'tennis': ['tennis elbow', 'shoulder injuries']
  };

  return risks[sport.toLowerCase()] || ['Common sports injuries'];
};
