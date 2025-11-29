const caseService = require('./case.service');

/**
 * Create a new case
 */
const createCase = async (req, res) => {
  try {
    const caseData = req.body;
    const createdBy = req.user.id;
    
    const newCase = await caseService.createCase({ ...caseData, createdBy });
    
    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      data: newCase
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all cases
 */
const getAllCases = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const cases = await caseService.getAllCases({ page, limit, status });
    
    res.status(200).json({
      success: true,
      data: cases
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get case by ID
 */
const getCaseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const caseData = await caseService.getCaseById(id);
    
    res.status(200).json({
      success: true,
      data: caseData
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update case
 */
const updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedCase = await caseService.updateCase(id, updates);
    
    res.status(200).json({
      success: true,
      message: 'Case updated successfully',
      data: updatedCase
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete case
 */
const deleteCase = async (req, res) => {
  try {
    const { id } = req.params;
    
    await caseService.deleteCase(id);
    
    res.status(200).json({
      success: true,
      message: 'Case deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createCase,
  getAllCases,
  getCaseById,
  updateCase,
  deleteCase
};
