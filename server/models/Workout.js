const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  setNumber: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['normal', 'warmup', 'dropset', 'failure'],
    default: 'normal',
  },
  weight: {
    type: Number,
    required: true,
    default: 0,
  },
  reps: {
    type: Number,
    required: true,
    default: 0,
  },
  rpe: {
    type: Number,
    min: 1,
    max: 10,
    default: null,
  },
  completed: {
    type: Boolean,
    default: true,
  },
  estimated1RM: {
    type: Number,
    default: 0,
  },
});

const workoutExerciseSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: false,
  },
  exerciseName: {
    type: String,
    required: true,
  },
  targetMuscle: {
    type: String,
    default: 'Full Body',
  },
  sets: [setSchema],
  notes: {
    type: String,
    default: '',
  },
});

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'Workout Session',
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    totalVolume: {
      type: Number, // total kg / lbs lifted (weight * reps)
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    exercises: [workoutExerciseSchema],
    prsAchieved: [{
      exerciseName: String,
      type: String, // 'Weight' or '1RM' or 'Volume'
      value: Number,
    }],
  },
  {
    timestamps: true,
  }
);

// Calculate total volume and 1RM before saving
workoutSchema.pre('save', function (next) {
  let volume = 0;
  if (this.exercises && this.exercises.length > 0) {
    this.exercises.forEach((ex) => {
      if (ex.sets && ex.sets.length > 0) {
        ex.sets.forEach((s) => {
          if (s.completed && s.type !== 'warmup') {
            volume += (s.weight || 0) * (s.reps || 0);
          }
          // Epley formula: w * (1 + r / 30)
          if (s.reps > 0 && s.weight > 0) {
            s.estimated1RM = Math.round(s.weight * (1 + s.reps / 30) * 10) / 10;
          }
        });
      }
    });
  }
  this.totalVolume = Math.round(volume);
  next();
});

module.exports = mongoose.model('Workout', workoutSchema);
