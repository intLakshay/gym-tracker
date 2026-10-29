const Exercise = require('../models/Exercise');

const DEFAULT_EXERCISES = [
  { name: 'Barbell Bench Press', targetMuscle: 'Chest', category: 'Barbell', secondaryMuscles: ['Triceps', 'Shoulders'] },
  { name: 'Incline Dumbbell Press', targetMuscle: 'Chest', category: 'Dumbbell', secondaryMuscles: ['Triceps', 'Shoulders'] },
  { name: 'Cable Chest Fly', targetMuscle: 'Chest', category: 'Cable', secondaryMuscles: ['Shoulders'] },
  { name: 'Dips (Chest Focus)', targetMuscle: 'Chest', category: 'Bodyweight', secondaryMuscles: ['Triceps'] },
  { name: 'Push Ups', targetMuscle: 'Chest', category: 'Bodyweight', secondaryMuscles: ['Triceps', 'Core'] },

  { name: 'Barbell Deadlift', targetMuscle: 'Back', category: 'Barbell', secondaryMuscles: ['Legs', 'Glutes', 'Core'] },
  { name: 'Pull-Up', targetMuscle: 'Back', category: 'Bodyweight', secondaryMuscles: ['Biceps'] },
  { name: 'Lat Pulldown', targetMuscle: 'Back', category: 'Cable', secondaryMuscles: ['Biceps'] },
  { name: 'Barbell Bent Over Row', targetMuscle: 'Back', category: 'Barbell', secondaryMuscles: ['Biceps'] },
  { name: 'Seated Cable Row', targetMuscle: 'Back', category: 'Cable', secondaryMuscles: ['Biceps'] },
  { name: 'Dumbbell Row', targetMuscle: 'Back', category: 'Dumbbell', secondaryMuscles: ['Biceps'] },

  { name: 'Barbell Back Squat', targetMuscle: 'Legs', category: 'Barbell', secondaryMuscles: ['Glutes', 'Core'] },
  { name: 'Leg Press', targetMuscle: 'Legs', category: 'Machine', secondaryMuscles: ['Glutes'] },
  { name: 'Romanian Deadlift (RDL)', targetMuscle: 'Legs', category: 'Barbell', secondaryMuscles: ['Glutes', 'Back'] },
  { name: 'Leg Extension', targetMuscle: 'Legs', category: 'Machine', secondaryMuscles: [] },
  { name: 'Seated Leg Curl', targetMuscle: 'Legs', category: 'Machine', secondaryMuscles: [] },
  { name: 'Standing Calf Raise', targetMuscle: 'Legs', category: 'Machine', secondaryMuscles: [] },
  { name: 'Bulgarian Split Squat', targetMuscle: 'Legs', category: 'Dumbbell', secondaryMuscles: ['Glutes'] },

  { name: 'Overhead Barbell Press', targetMuscle: 'Shoulders', category: 'Barbell', secondaryMuscles: ['Triceps'] },
  { name: 'Seated Dumbbell Shoulder Press', targetMuscle: 'Shoulders', category: 'Dumbbell', secondaryMuscles: ['Triceps'] },
  { name: 'Dumbbell Lateral Raise', targetMuscle: 'Shoulders', category: 'Dumbbell', secondaryMuscles: [] },
  { name: 'Cable Lateral Raise', targetMuscle: 'Shoulders', category: 'Cable', secondaryMuscles: [] },
  { name: 'Face Pull', targetMuscle: 'Shoulders', category: 'Cable', secondaryMuscles: ['Back'] },

  { name: 'Barbell Bicep Curl', targetMuscle: 'Biceps', category: 'Barbell', secondaryMuscles: [] },
  { name: 'Incline Dumbbell Curl', targetMuscle: 'Biceps', category: 'Dumbbell', secondaryMuscles: [] },
  { name: 'Hammer Curl', targetMuscle: 'Biceps', category: 'Dumbbell', secondaryMuscles: [] },

  { name: 'Tricep Rope Pushdown', targetMuscle: 'Triceps', category: 'Cable', secondaryMuscles: [] },
  { name: 'Skull Crusher', targetMuscle: 'Triceps', category: 'Barbell', secondaryMuscles: [] },
  { name: 'Overhead Cable Tricep Extension', targetMuscle: 'Triceps', category: 'Cable', secondaryMuscles: [] },

  { name: 'Hanging Leg Raise', targetMuscle: 'Abs', category: 'Bodyweight', secondaryMuscles: [] },
  { name: 'Cable Woodchopper', targetMuscle: 'Abs', category: 'Cable', secondaryMuscles: [] },
  { name: 'Plank', targetMuscle: 'Abs', category: 'Bodyweight', secondaryMuscles: [] },
  { name: 'Barbell Hip Thrust', targetMuscle: 'Glutes', category: 'Barbell', secondaryMuscles: ['Legs'] }
];

// @desc    Get all exercises (Defaults + User's custom exercises)
// @route   GET /api/exercises
// @access  Private
const getExercises = async (req, res) => {
  try {
    // Check if defaults need seeding
    const defaultCount = await Exercise.countDocuments({ isCustom: false });
    if (defaultCount === 0) {
      await Exercise.insertMany(DEFAULT_EXERCISES.map(e => ({ ...e, isCustom: false, user: null })));
    }

    const exercises = await Exercise.find({
      $or: [{ isCustom: false }, { user: req.user._id }],
    }).sort({ name: 1 });

    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a custom exercise
// @route   POST /api/exercises
// @access  Private
const createExercise = async (req, res) => {
  try {
    const { name, targetMuscle, category, secondaryMuscles, notes } = req.body;

    if (!name || !targetMuscle) {
      return res.status(400).json({ message: 'Name and target muscle are required' });
    }

    const exercise = await Exercise.create({
      name: name.trim(),
      targetMuscle,
      category: category || 'Barbell',
      secondaryMuscles: secondaryMuscles || [],
      notes: notes || '',
      isCustom: true,
      user: req.user._id,
    });

    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete custom exercise
// @route   DELETE /api/exercises/:id
// @access  Private
const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    if (!exercise.isCustom || String(exercise.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Cannot delete default system exercises or exercises owned by others' });
    }

    await exercise.deleteOne();
    res.json({ message: 'Exercise removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExercises,
  createExercise,
  deleteExercise,
  DEFAULT_EXERCISES
};
