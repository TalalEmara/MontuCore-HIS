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

/**
 * Analyze imaging findings with CDSS
 * @route POST /api/cdss/analyze
 * @access Public
 */
export const analyzeImaging = async (req: Request, res: Response): Promise<void> => {
  try {
    const { athlete, imaging } = req.body;

    if (!athlete || !imaging) {
      res.status(400).json({
        success: false,
        message: 'Required fields: athlete (name, age, sport), imaging (type, findings, severity)'
      });
      return;
    }

    const result = cdssService.analyzeImagingFindings(athlete, imaging);

    res.status(200).json({
      success: true,
      athlete,
      analysis: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get sport-specific risks
 * @route GET /api/cdss/sport-risks/:sport
 * @access Public
 */
export const getSportRisks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sport } = req.params;

    if (!sport) {
      res.status(400).json({
        success: false,
        message: 'Required parameter: sport'
      });
      return;
    }

    const risks = cdssService.getSportRisks(sport);

    res.status(200).json({
      success: true,
      sport,
      commonInjuries: risks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


/**
 * Analyze DICOM image with AI models
 * @route POST /api/cdss/analyze-dicom
 * @access Public (add auth in production)
 */
export const analyzeDicom = asyncHandler(async (req: Request, res: Response) => {
  const { dicomUrl, patientId, examId } = req.body;

  // Validation
  if (!dicomUrl) {
    throw new ValidationError('dicomUrl is required');
  }

  // Optional: Validate URL format
  try {
    new URL(dicomUrl);
  } catch (error) {
    throw new ValidationError('Invalid dicomUrl format');
  }

  console.log(`🔍 Analyzing DICOM for Patient ${patientId || 'N/A'}, Exam ${examId || 'N/A'}`);
  console.log(`📥 DICOM URL: ${dicomUrl}`);

  try {
    // Call AI Service
    const response = await axios.post<AIAnalysisResult>(
      `${AI_SERVICE_URL}/analyze`,
      {
        dicomUrl: dicomUrl,
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

    // Optional: Save results to database
    // if (examId) {
    //   await prisma.exam.update({
    //     where: { id: examId },
    //     data: {
    //       aiAnalysisResults: aiResult,
    //       radiologistNotes: `AI Analysis: ACL ${(aiResult.acl?.probability * 100).toFixed(1)}%, Meniscus ${(aiResult.meniscus?.probability * 100).toFixed(1)}%`
    //     }
    //   });
    // }

    // Return structured response
    res.status(200).json({
      success: true,
      data: {
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
      message: aiResult.abnormal_detected 
        ? 'Abnormality detected - Review recommended' 
        : 'No significant abnormality detected'
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
        return res.status(axiosError.response.status).json({
          success: false,
          error: 'AI Analysis failed',
          message: axiosError.response.data.detail || 'Analysis failed',
          details: axiosError.response.data
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
