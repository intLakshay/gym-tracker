const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getExerciseProgression,
} = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardStats);
router.get('/exercise/:exerciseName', protect, getExerciseProgression);

module.exports = router;

