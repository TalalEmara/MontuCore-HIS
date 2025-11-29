const appointmentService = require('./appointment.service');

/**
 * Create a new appointment
 */
const createAppointment = async (req, res) => {
  try {
    const appointmentData = req.body;
    const createdBy = req.user.id;
    
    const newAppointment = await appointmentService.createAppointment({ ...appointmentData, createdBy });
    
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: newAppointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all appointments
 */
const getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, patientId, doctorId, date } = req.query;
    
    const appointments = await appointmentService.getAllAppointments({ page, limit, status, patientId, doctorId, date });
    
    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get appointment by ID
 */
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await appointmentService.getAppointmentById(id);
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update appointment
 */
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedAppointment = await appointmentService.updateAppointment(id, updates);
    
    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: updatedAppointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Cancel appointment
 */
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const cancelledAppointment = await appointmentService.cancelAppointment(id, reason);
    
    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: cancelledAppointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment
};
