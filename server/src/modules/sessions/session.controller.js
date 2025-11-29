const sessionService = require('./session.service');

/**
 * Create a new session
 */
const createSession = async (req, res) => {
  try {
    const sessionData = req.body;
    const createdBy = req.user.id;
    
    const newSession = await sessionService.createSession({ ...sessionData, createdBy });
    
    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: newSession
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all sessions
 */
const getAllSessions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, patientId, caseId } = req.query;
    
    const sessions = await sessionService.getAllSessions({ page, limit, status, patientId, caseId });
    
    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get session by ID
 */
const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await sessionService.getSessionById(id);
    
    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update session
 */
const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedSession = await sessionService.updateSession(id, updates);
    
    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      data: updatedSession
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Complete session
 */
const completeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, prescriptions } = req.body;
    
    const completedSession = await sessionService.completeSession(id, { notes, prescriptions });
    
    res.status(200).json({
      success: true,
      message: 'Session completed successfully',
      data: completedSession
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createSession,
  getAllSessions,
  getSessionById,
  updateSession,
  completeSession
};
