// server/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const authRoutes = require('./routes/auth'); // Import routes

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // Mount auth routes at /api/auth

// Health Check
app.get('/', (req, res) => {
  res.send('Sports HIS Backend is Running!');
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