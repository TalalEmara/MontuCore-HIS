import type { Request, Response } from 'express';
import * as cdssService from './cdss.service.js';
import axios, { AxiosError } from 'axios';
import { asyncHandler } from '../../utils/responseHandlers.js';
import { ValidationError } from '../../utils/AppError.js';

// AI Service Configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';
const AI_SERVICE_TIMEOUT = 60000; // 60 seconds

/**
 * AI Analysis Response Interface
 */
interface AIAnalysisResult {
  success: boolean;
  acl?: {
    probability: number;
    confidence_level: string;
    heatmap?: string;
  };
  meniscus?: {
    probability: number;
    confidence_level: string;
    heatmap?: string;
  };
  abnormal?: {
    probability: number;
    confidence_level: string;
    heatmap?: string;
  };
  abnormal_probability: number;
  abnormal_detected: boolean;
  threshold: number;
  message?: string;
  metadata?: any;
}

// Note: analyzeImaging and getSportRisks methods removed as they are not implemented in cdss.service.ts
// The main CDSS functionality is in analyzeDicom below


/**
 * Analyze DICOM image with AI models
 * @route POST /api/cdss/analyze-dicom
 * @access Public (add auth in production)
 */
export const analyzeDicom = asyncHandler(async (req: Request, res: Response) => {
  const { dicomUrls, patientId, examId } = req.body;

  // Validation
  if (!dicomUrls || !Array.isArray(dicomUrls) || dicomUrls.length !== 3) {
    throw new ValidationError('dicomUrls must be an array of exactly 3 URLs');
  }

  // Validate each URL
  for (let i = 0; i < dicomUrls.length; i++) {
    try {
      new URL(dicomUrls[i]);
    } catch (error) {
      throw new ValidationError(`Invalid dicomUrl at index ${i}`);
    }
  }

  console.log(`🔍 Analyzing DICOM for Patient ${patientId || 'N/A'}, Exam ${examId || 'N/A'}`);
  console.log(`📥 DICOM URLs: ${dicomUrls.join(', ')}`);

  try {
    // Call AI Service
    const response = await axios.post<AIAnalysisResult>(
      `${AI_SERVICE_URL}/analyze`,
      {
        dicomUrls: dicomUrls,
        patientId: patientId,
        examId: examId
      },
      {
        timeout: AI_SERVICE_TIMEOUT,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResult = response.data;

    console.log('✅ AI Analysis complete');
    console.log(`📊 ACL: ${aiResult.acl?.probability.toFixed(4)} (${aiResult.acl?.confidence_level})`);
    console.log(`📊 Meniscus: ${aiResult.meniscus?.probability.toFixed(4)} (${aiResult.meniscus?.confidence_level})`);
    console.log(`📊 Abnormal Model: ${aiResult.abnormal?.probability.toFixed(4)} (${aiResult.abnormal?.confidence_level})`);
    console.log(`🎯 Overall Abnormal: ${aiResult.abnormal_detected} (${aiResult.abnormal_probability.toFixed(4)})`);

    // Determine primary diagnosis based on highest probability
    const THRESHOLD = aiResult.threshold || 0.5;
    const findings = [
      { type: 'ACL Tear', probability: aiResult.acl?.probability || 0, model: 'acl' },
      { type: 'Meniscus Tear', probability: aiResult.meniscus?.probability || 0, model: 'meniscus' }
    ];
    
    // Sort by probability (highest first)
    findings.sort((a, b) => b.probability - a.probability);
    
    let diagnosis = 'Normal';
    let diagnosisDetails = 'No significant abnormality detected';
    let severity: 'normal' | 'low' | 'moderate' | 'high' = 'normal';
    
    // Check if highest probability exceeds threshold
    const highestFinding = findings[0];
    if (highestFinding && highestFinding.probability >= THRESHOLD) {
      diagnosis = highestFinding.type;
      const percentage = (highestFinding.probability * 100).toFixed(1);
      
      // Determine severity
      if (highestFinding.probability >= 0.8) {
        severity = 'high';
        diagnosisDetails = `High probability of ${highestFinding.type} detected (${percentage}%). Immediate review recommended.`;
      } else if (highestFinding.probability >= 0.65) {
        severity = 'moderate';
        diagnosisDetails = `Moderate probability of ${highestFinding.type} detected (${percentage}%). Clinical correlation advised.`;
      } else {
        severity = 'low';
        diagnosisDetails = `Possible ${highestFinding.type} detected (${percentage}%). Further evaluation recommended.`;
      }
      
      // Add secondary findings if also above threshold
      const secondaryFindings = findings.slice(1).filter(f => f.probability >= THRESHOLD);
      if (secondaryFindings.length > 0) {
        const secondaryNames = secondaryFindings.map(f => `${f.type} (${(f.probability * 100).toFixed(1)}%)`).join(', ');
        diagnosisDetails += ` Additionally: ${secondaryNames}.`;
      }
    } else if (aiResult.abnormal_detected) {
      // Abnormal model detected something but specific findings are below threshold
      diagnosis = 'General Abnormality';
      severity = 'low';
      diagnosisDetails = `General abnormality detected (${(aiResult.abnormal_probability * 100).toFixed(1)}%), but specific pathology unclear. Clinical review recommended.`;
    } else {
      const aclProb = aiResult.acl?.probability ?? 0;
      const meniscusProb = aiResult.meniscus?.probability ?? 0;
      diagnosisDetails = `All findings within normal limits. ACL: ${(aclProb * 100).toFixed(1)}%, Meniscus: ${(meniscusProb * 100).toFixed(1)}%.`;
    }

    console.log(`🩺 Diagnosis: ${diagnosis} (${severity})`);
    console.log(`📝 Details: ${diagnosisDetails}`);

    // Optional: Save results to database
    // if (examId) {
    //   await prisma.exam.update({
    //     where: { id: examId },
    //     data: {
    //       aiAnalysisResults: aiResult,
    //       radiologistNotes: diagnosisDetails
    //     }
    //   });
    // }

    // Return structured response
    res.status(200).json({
      success: true,
      data: {
        diagnosis: {
          primary: diagnosis,
          severity: severity,
          details: diagnosisDetails,
          confidence: highestFinding?.probability || 0
        },
        analysis: {
          acl: aiResult.acl,
          meniscus: aiResult.meniscus,
          abnormalModel: aiResult.abnormal, // Dedicated abnormal model prediction
          abnormalOverall: {
            detected: aiResult.abnormal_detected,
            probability: aiResult.abnormal_probability,
            threshold: aiResult.threshold
          }
        },
        metadata: {
          patientId: patientId,
          examId: examId,
          analyzedAt: new Date().toISOString(),
          aiServiceUrl: AI_SERVICE_URL,
          modelsUsed: ['acl', 'meniscus', aiResult.abnormal ? 'abnormal' : null].filter(Boolean),
          ...aiResult.metadata
        }
      },
      message: diagnosisDetails
    });

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.code === 'ECONNREFUSED') {
        console.error('❌ AI Service not reachable. Is FastAPI running?');
        return res.status(503).json({
          success: false,
          error: 'AI Service unavailable',
          message: 'The AI analysis service is not running. Please ensure FastAPI is started.',
          details: `Connection refused to ${AI_SERVICE_URL}`
        });
      }

      if (axiosError.response) {
        // AI service returned an error
        console.error('❌ AI Service error:', axiosError.response.data);
        const errorData = axiosError.response.data as any;
        return res.status(axiosError.response.status).json({
          success: false,
          error: 'AI Analysis failed',
          message: errorData?.detail || 'Analysis failed',
          details: errorData
        });
      }

      if (axiosError.code === 'ETIMEDOUT' || axiosError.code === 'ECONNABORTED') {
        console.error('❌ AI Service timeout');
        return res.status(504).json({
          success: false,
          error: 'Analysis timeout',
          message: 'AI analysis took too long. Please try again.',
        });
      }
    }

    // Generic error
    console.error('❌ Unexpected error:', error);
    throw error;
  }
});
