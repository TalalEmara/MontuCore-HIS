import * as imagingController from './imaging.controller.js';
import { authenticateToken } from '../../middleware/auth.js';
import { Router, type Router as RouterType } from 'express';
import multer from 'multer';
import { uploadAndProcessScan, linkScanSeries } from './pacs.controller.js';

const router: RouterType = Router();

// Store file in memory (RAM) temporarily
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// POST /api/imaging/upload
// Frontend sends FormData: key="file" (the .dcm), key="caseId"
router.post('/upload', upload.single('file'), uploadAndProcessScan);

/**
 * @route   POST /api/imaging/link-series
 * @desc    Link a series of DICOM images to a case (batch upload). Metadata is automatically extracted from the first DICOM file.
 * @access  Public (to be protected with auth in production)
 * @body    { caseId: number, images: Array<{fileName: string, supabasePath: string}> }
 */
router.post('/link-series', linkScanSeries);


/**
 * @route   POST /api/imaging
 * @desc    Create a new imaging order
 * @access  Private
 */
router.post('/', authenticateToken, imagingController.createImagingOrder);

/**
 * @route   GET /api/imaging
 * @desc    Get all imaging orders
 * @access  Private
 */
router.get('/', authenticateToken, imagingController.getAllImagingOrders);

/**
 * @route   GET /api/imaging/:id
 * @desc    Get imaging order by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, imagingController.getImagingOrderById);

/**
 * @route   PUT /api/imaging/:id
 * @desc    Update imaging order
 * @access  Private
 */
router.put('/:id', authenticateToken, imagingController.updateImagingOrder);

/**
 * @route   POST /api/imaging/:id/results
 * @desc    Upload imaging results
 * @access  Private
 */
router.post('/:id/results', authenticateToken, imagingController.uploadImagingResults);

export default router;
