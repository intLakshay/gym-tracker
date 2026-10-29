const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide exercise name'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Cardio', 'Other'],
      default: 'Barbell',
    },
    targetMuscle: {
      type: String,
      required: [true, 'Target muscle group is required'],
      enum: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Glutes', 'Full Body', 'Cardio'],
    },
    secondaryMuscles: [{
      type: String,
    }],
    notes: {
      type: String,
      default: '',
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Exercise', exerciseSchema);
