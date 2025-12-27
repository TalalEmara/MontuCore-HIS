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
  diagnosis: {
    acl?: {
      probability: number;
      confidence_level: string;
    };
    meniscus?: {
      probability: number;
      confidence_level: string;
    };
    abnormal?: {
      probability: number;
      confidence_level: string;
    };
  };
  heatmap?: string[];
  abnormal_detected: boolean;
  abnormal_probability: number;
  threshold: number;
  metadata?: any;
  message?: string;
}

// Note: analyzeImaging and getSportRisks methods removed as they are not implemented in cdss.service.ts
// The main CDSS functionality is in analyzeDicom below


/**
 * Analyze DICOM image with AI models
 * @route POST /api/cdss/analyze-dicom
 * @access Public (add auth in production)
 */
export const analyzeDicom = asyncHandler(async (req: Request, res: Response) => {
  const { dicomUrls } = req.body;

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

  console.log(`🔍 Analyzing DICOM with ${dicomUrls.length} sagittal slices`);
  console.log(`📥 DICOM URLs: ${dicomUrls.join(', ')}`);

  try {
    // Call AI Service
    const response = await axios.post<AIAnalysisResult>(
      `${AI_SERVICE_URL}/analyze`,
      {
        dicomUrls: dicomUrls
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
    console.log(`📊 ACL: ${aiResult.diagnosis.acl?.probability.toFixed(4)} (${aiResult.diagnosis.acl?.confidence_level})`);
    console.log(`📊 Meniscus: ${aiResult.diagnosis.meniscus?.probability.toFixed(4)} (${aiResult.diagnosis.meniscus?.confidence_level})`);
    console.log(`📊 Abnormal Model: ${aiResult.diagnosis.abnormal?.probability.toFixed(4)} (${aiResult.diagnosis.abnormal?.confidence_level})`);
    console.log(`🎯 Overall Abnormal: ${aiResult.abnormal_detected} (${aiResult.abnormal_probability.toFixed(4)})`);

    // Determine which model has the highest probability (matching Python logic)
    const modelProbabilities = {
      acl: aiResult.diagnosis.acl?.probability || 0,
      meniscus: aiResult.diagnosis.meniscus?.probability || 0,
      abnormal: aiResult.diagnosis.abnormal?.probability || 0
    };

    // Find the model with highest probability
    const highestModel = Object.entries(modelProbabilities)
      .reduce((a, b) => modelProbabilities[a[0] as keyof typeof modelProbabilities] > modelProbabilities[b[0] as keyof typeof modelProbabilities] ? a : b)[0];

    console.log(`🏆 Highest probability model: ${highestModel} (${modelProbabilities[highestModel as keyof typeof modelProbabilities].toFixed(4)})`);

    // Determine diagnosis only if it corresponds to the highest probability model
    let diagnosis = null;
    let severity = null;
    let diagnosisDetails = null;

    const THRESHOLD = aiResult.threshold || 0.5;
    const findings = [
      { type: 'ACL Tear', probability: aiResult.diagnosis.acl?.probability || 0, model: 'acl' },
      { type: 'Meniscus Tear', probability: aiResult.diagnosis.meniscus?.probability || 0, model: 'meniscus' }
    ];

    // Sort by probability (highest first)
    findings.sort((a, b) => b.probability - a.probability);

    // Check if highest probability exceeds threshold and matches the AI's highest model
    const highestFinding = findings[0];
    if (highestFinding && highestFinding.probability >= THRESHOLD && highestFinding.model === highestModel) {
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
    } else if (aiResult.abnormal_detected && highestModel === 'abnormal') {
      // Abnormal model detected something and it's the highest probability model
      diagnosis = 'General Abnormality';
      severity = 'low';
      diagnosisDetails = `General abnormality detected (${(aiResult.abnormal_probability * 100).toFixed(1)}%), but specific pathology unclear. Clinical review recommended.`;
    }

    if (diagnosis) {
      console.log(`🩺 Diagnosis: ${diagnosis} (${severity})`);
      console.log(`📝 Details: ${diagnosisDetails}`);
    }

    // Create analysis object with only the highest probability model having full results
    const analysis: any = {};

    // Only include full results for the highest probability model
    if (highestModel === 'acl' && aiResult.diagnosis.acl) {
      analysis.acl = aiResult.diagnosis.acl;
    }
    if (highestModel === 'meniscus' && aiResult.diagnosis.meniscus) {
      analysis.meniscus = aiResult.diagnosis.meniscus;
    }
    if (highestModel === 'abnormal' && aiResult.diagnosis.abnormal) {
      analysis.abnormal = aiResult.diagnosis.abnormal;
    }

    // Add abnormal overall results
    analysis.abnormal_probability = aiResult.abnormal_probability;
    analysis.abnormal_detected = aiResult.abnormal_detected;
    analysis.threshold = aiResult.threshold;

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

    // Return structured response matching Python FastAPI structure
    const result: any = {
      success: true,
      diagnosis: {
        acl: analysis.acl,
        meniscus: analysis.meniscus,
        abnormal: analysis.abnormal,
      },
      heatmap: aiResult.heatmap,
      abnormal_probability: analysis.abnormal_probability,
      abnormal_detected: analysis.abnormal_detected,
      threshold: analysis.threshold
    };

    // Only include diagnosis information if it corresponds to the highest probability model
    if (diagnosis) {
      result.diagnosis.primary = diagnosis;
      result.diagnosis.severity = severity;
      result.diagnosis.details = diagnosisDetails;
      result.diagnosis.confidence = highestFinding?.probability || 0;
      result.message = diagnosisDetails;
    }

    res.status(200).json(result);

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
