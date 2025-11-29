const billingService = require('./billing.service');

/**
 * Create a new invoice
 */
const createInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;
    const createdBy = req.user.id;
    
    const newInvoice = await billingService.createInvoice({ ...invoiceData, createdBy });
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: newInvoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all invoices
 */
const getAllInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, patientId } = req.query;
    
    const invoices = await billingService.getAllInvoices({ page, limit, status, patientId });
    
    res.status(200).json({
      success: true,
      data: invoices
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get invoice by ID
 */
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await billingService.getInvoiceById(id);
    
    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update invoice
 */
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedInvoice = await billingService.updateInvoice(id, updates);
    
    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: updatedInvoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Record payment
 */
const recordPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;
    
    const payment = await billingService.recordPayment(id, paymentData);
    
    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get patient billing summary
 */
const getPatientBillingSummary = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const summary = await billingService.getPatientBillingSummary(patientId);
    
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  recordPayment,
  getPatientBillingSummary
};
