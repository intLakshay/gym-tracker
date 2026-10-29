const express = require('express');
const router = express.Router();
const {
  getExercises,
  createExercise,
  deleteExercise,
} = require('../controllers/exerciseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getExercises)
  .post(protect, createExercise);

router.route('/:id')
  .delete(protect, deleteExercise);

module.exports = router;
