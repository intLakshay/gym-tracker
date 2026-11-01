const mongoose = require('mongoose');
const Workout = require('../models/Workout');

// @desc    Get all workouts for logged-in user
// @route   GET /api/workouts
// @access  Private
const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id })
      .sort({ date: -1 });

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single workout by ID
// @route   GET /api/workouts/:id
// @access  Private
const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new workout & compute PRs
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res) => {
  try {
    const { title, date, duration, notes, exercises } = req.body;

    if (!exercises || exercises.length === 0) {
      return res.status(400).json({ message: 'A workout must contain at least one exercise' });
    }

    // Retrieve previous workouts to check for Personal Records (PRs)
    const pastWorkouts = await Workout.find({ user: req.user._id });
    
    // Build a map of max weight and max 1RM achieved historically per exercise
    const historicalMaxMap = {};
    pastWorkouts.forEach((w) => {
      w.exercises?.forEach((ex) => {
        const name = ex.exerciseName.toLowerCase();
        if (!historicalMaxMap[name]) {
          historicalMaxMap[name] = { maxWeight: 0, max1RM: 0 };
        }
        ex.sets?.forEach((s) => {
          if (s.completed) {
            if (s.weight > historicalMaxMap[name].maxWeight) {
              historicalMaxMap[name].maxWeight = s.weight;
            }
            if (s.estimated1RM > historicalMaxMap[name].max1RM) {
              historicalMaxMap[name].max1RM = s.estimated1RM;
            }
          }
        });
      });
    });

    // Check newly submitted sets against historical max
    const prsAchieved = [];
    const cleanExercises = exercises.map((ex) => {
      const name = ex.exerciseName.toLowerCase();
      const hist = historicalMaxMap[name] || { maxWeight: 0, max1RM: 0 };
      
      let currentSessionMaxWeight = 0;
      let currentSessionMax1RM = 0;

      const cleanSets = (ex.sets || []).map((s) => {
        const setWeight = Number(s.weight) || 0;
        const setReps = Number(s.reps) || 0;
        const isCompleted = s.completed !== false;
        const epley1RM = setReps > 0 && setWeight > 0
          ? Math.round((setWeight * (1 + setReps / 30)) * 10) / 10
          : 0;

        if (isCompleted && s.type !== 'warmup') {
          if (setWeight > currentSessionMaxWeight) currentSessionMaxWeight = setWeight;
          if (epley1RM > currentSessionMax1RM) currentSessionMax1RM = epley1RM;
        }

        return {
          setNumber: s.setNumber,
          type: s.type || 'normal',
          weight: setWeight,
          reps: setReps,
          rpe: s.rpe || null,
          completed: isCompleted,
          estimated1RM: epley1RM,
        };
      });

      // If user had previous logs for this exercise and beat their max weight or 1RM
      if (hist.maxWeight > 0 && currentSessionMaxWeight > hist.maxWeight) {
        prsAchieved.push({
          exerciseName: ex.exerciseName,
          type: 'Max Weight',
          value: currentSessionMaxWeight,
        });
      } else if (hist.max1RM > 0 && currentSessionMax1RM > hist.max1RM) {
        prsAchieved.push({
          exerciseName: ex.exerciseName,
          type: 'Estimated 1RM',
          value: currentSessionMax1RM,
        });
      }

      return {
        exercise: ex.exercise || null,
        exerciseName: ex.exerciseName,
        targetMuscle: ex.targetMuscle || 'Full Body',
        sets: cleanSets,
        notes: ex.notes || '',
      };
    });

    const workout = new Workout({
      user: req.user._id,
      title: title || 'Workout Session',
      date: date || new Date(),
      duration: duration || 0,
      notes: notes || '',
      exercises: cleanExercises,
      prsAchieved,
    });

    const savedWorkout = await workout.save();
    res.status(201).json(savedWorkout);
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    await workout.deleteOne();
    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get the user's last recorded sets for an exercise
// @route   GET /api/workouts/last-performance/:exerciseName
// @access  Private
const getLastExercisePerformance = async (req, res) => {
  try {
    const { exerciseName } = req.params;
    const workout = await Workout.findOne({
      user: req.user._id,
      'exercises.exerciseName': new RegExp(`^${exerciseName}$`, 'i'),
    }).sort({ date: -1 });

    if (!workout) {
      return res.json({ found: false, sets: [] });
    }

    const matchedEx = workout.exercises.find(
      (e) => e.exerciseName.toLowerCase() === exerciseName.toLowerCase()
    );

    res.json({
      found: true,
      date: workout.date,
      sets: matchedEx ? matchedEx.sets : [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  deleteWorkout,
  getLastExercisePerformance,
};
