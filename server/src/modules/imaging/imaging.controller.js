const imagingService = require('./imaging.service');

/**
 * Create a new imaging order
 */
const createImagingOrder = async (req, res) => {
  try {
    const orderData = req.body;
    const orderedBy = req.user.id;
    
    const newOrder = await imagingService.createImagingOrder({ ...orderData, orderedBy });
    
    res.status(201).json({
      success: true,
      message: 'Imaging order created successfully',
      data: newOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all imaging orders
 */
const getAllImagingOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, patientId } = req.query;
    
    const orders = await imagingService.getAllImagingOrders({ page, limit, status, patientId });
    
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get imaging order by ID
 */
const getImagingOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await imagingService.getImagingOrderById(id);
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update imaging order
 */
const updateImagingOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedOrder = await imagingService.updateImagingOrder(id, updates);
    
    res.status(200).json({
      success: true,
      message: 'Imaging order updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Upload imaging results
 */
const uploadImagingResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { results, dicomUrl, reportUrl } = req.body;
    
    const updatedOrder = await imagingService.uploadImagingResults(id, { results, dicomUrl, reportUrl });
    
    res.status(200).json({
      success: true,
      message: 'Imaging results uploaded successfully',
      data: updatedOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createImagingOrder,
  getAllImagingOrders,
  getImagingOrderById,
  updateImagingOrder,
  uploadImagingResults
};
