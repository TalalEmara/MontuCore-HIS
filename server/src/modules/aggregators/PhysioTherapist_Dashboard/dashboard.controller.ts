// get the physio id from the input query parameters 
// return all active cases of this physio therapist
// for each case, return the today's appointments
// no pagination at all, just return all data
import * as ApptService from '../../appointments/appointment.service.js';
import * as CaseService from '../../cases/case.service.js';
import type { Request, Response } from 'express';
import * as TreatmentService from '../../treatments/treatment.service.js';
import * as ExamService from '../../imaging/exam.service.js';
import * as LabTestService from '../../lab_tests/labtest.service.js';
/**

    * Get Physio Therapist Dashboard Data 
**/
export const getPhysioTherapistDashboard = async (req: Request, res: Response) => {
  try {
    const { physioId } = req.params;
    const physioIdNum = parseInt(physioId as string);

    if (isNaN(physioIdNum)) {
      return res.status(400).json({ error: 'Invalid physio therapist ID' });
    }
    // Execute all queries in parallel 
    const [activeCases, todaysAppointments] = await Promise.all([
        CaseService.getActiveCasesByPhysioId(physioIdNum),
        ApptService.getTodaysAppointmentsByPhysioId(physioIdNum)
    ]);
    res.status(200).json({
      success: true,
      data: {
        activeCases,
        todaysAppointments
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};