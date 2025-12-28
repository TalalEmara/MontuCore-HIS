import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './config/db.js';

// Import all routes
import authRoutes from './modules/auth/auth.routes.js';
import caseRoutes from './modules/cases/case.routes.js';
import imagingRoutes from './modules/imaging/imaging.routes.js';
import appointmentRoutes from './modules/appointments/appointment.routes.js';
// import sessionRoutes from './modules/sessions/session.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';
import physicianDashboardRoutes from './modules/aggregators/Physician_Dashboard/dashboard.routes.js';
import athleteDashboardRoutes from './modules/aggregators/Athlete_Dashboard/dashboard.routes.js';
import treatmentRoutes from './modules/treatments/treatment.routes.js';
import examRoutes from './modules/imaging/exam.routes.js';
import labTestRoutes from './modules/lab_tests/labtest.routes.js';
import physioProgramRoutes from './modules/physio_program/physioprogram.routes.js';
import caseViewRoutes from './modules/aggregators/Case_View/caseview.routes.js';
import managerDashboardRoutes from './modules/aggregators/Manager_Dashboard/dashboard.routes.js';


import cdssRoutes from './modules/cdss/cdss.routes.js';
import physioDashboardRoutes from './modules/aggregators/PhysioTherapist_Dashboard/dashboard.routes.js';
import physioProgramRoutes from './modules/physioPrograms/physioProgram.routes.js';
import consultRoutes from './modules/consults/consult.routes.js';

const app = express();
export { prisma };
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/imaging', imagingRoutes);
app.use('/api/appointments', appointmentRoutes);
// app.use('/api/sessions', sessionRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/lab-tests', labTestRoutes);
app.use('/api/physio-programs', physioProgramRoutes);
app.use('/api/case-view', caseViewRoutes);
app.use('/api/physician', physicianDashboardRoutes);
app.use('/api/athlete', athleteDashboardRoutes);
app.use('/api/cdss', cdssRoutes);
app.use('/api/physio-therapist', physioDashboardRoutes);
app.use('/api/consults', consultRoutes);
app.use('/api/physio-programs', physioProgramRoutes);
app.use('/api/dashboard/manager', managerDashboardRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('MontuCore HIS Backend is Running!');
});

// Start Server
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to Database (Supabase)');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database Connection Error:', error);
    process.exit(1);
  }
}

startServer();