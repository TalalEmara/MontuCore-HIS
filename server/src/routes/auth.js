// server/src/routes/auth.js
const express = require('express');
const router = express.Router();

// GET /api/auth/test
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working!', timestamp: new Date() });
});

module.exports = router;