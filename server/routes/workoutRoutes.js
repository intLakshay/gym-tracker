const express = require('express');
const router = express.Router();
const {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  deleteWorkout,
  getLastExercisePerformance,
} = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getWorkouts)
  .post(protect, createWorkout);

router.get('/last-performance/:exerciseName', protect, getLastExercisePerformance);

router.route('/:id')
  .get(protect, getWorkoutById)
  .delete(protect, deleteWorkout);

module.exports = router;

