import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './config/db.js';

// Import all routes
import authRoutes from './modules/auth/auth.routes.js';
import caseRoutes from './modules/cases/case.routes.js';
import imagingRoutes from './modules/imaging/imaging.routes.js';
import appointmentRoutes from './modules/appointments/appointment.routes.js';
import sessionRoutes from './modules/sessions/session.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';

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
app.use('/api/sessions', sessionRoutes);
app.use('/api/billing', billingRoutes);

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