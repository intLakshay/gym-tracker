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
    type: mongoose.Schema.Types.Mixed,
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
      type: Number, // total weight * reps
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    exercises: [workoutExerciseSchema],
    prsAchieved: [{
      exerciseName: String,
      type: String, // 'Max Weight' or 'Estimated 1RM'
      value: Number,
    }],
  },
  {
    timestamps: true,
  }
);

// Calculate total volume and 1RM before saving (Mongoose 9 synchronous pre hook)
workoutSchema.pre('save', function () {
  let volume = 0;
  if (this.exercises && this.exercises.length > 0) {
    this.exercises.forEach((ex) => {
      if (ex.sets && ex.sets.length > 0) {
        ex.sets.forEach((s) => {
          if (s.completed && s.type !== 'warmup') {
            volume += (Number(s.weight) || 0) * (Number(s.reps) || 0);
          }
          if (s.reps > 0 && s.weight > 0) {
            s.estimated1RM = Math.round(Number(s.weight) * (1 + Number(s.reps) / 30) * 10) / 10;
          }
        });
      }
    });
  }
  this.totalVolume = Math.round(volume);
});

module.exports = mongoose.model('Workout', workoutSchema);
