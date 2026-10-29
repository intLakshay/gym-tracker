const Workout = require('../models/Workout');

// @desc    Get dashboard summary metrics
// @route   GET /api/stats/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id }).sort({ date: 1 });

    const totalWorkouts = workouts.length;
    let totalVolume = 0;
    let totalPRs = 0;
    let totalDuration = 0;
    const muscleFrequency = {};
    const recentWorkoutsChart = [];

    // Calculate this week's start (Monday or 7 days ago)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    let volumeThisWeek = 0;

    workouts.forEach((w) => {
      totalVolume += w.totalVolume || 0;
      totalDuration += w.duration || 0;
      if (w.prsAchieved && w.prsAchieved.length > 0) {
        totalPRs += w.prsAchieved.length;
      }

      if (new Date(w.date) >= oneWeekAgo) {
        volumeThisWeek += w.totalVolume || 0;
      }

      // Tally muscle groups
      if (w.exercises) {
        w.exercises.forEach((ex) => {
          const muscle = ex.targetMuscle || 'Other';
          muscleFrequency[muscle] = (muscleFrequency[muscle] || 0) + 1;
        });
      }
    });

    // Take the last 8 workouts for volume trend chart
    const last8Workouts = workouts.slice(-8);
    last8Workouts.forEach((w) => {
      recentWorkoutsChart.push({
        date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        title: w.title,
        volume: w.totalVolume,
        durationMin: Math.round((w.duration || 0) / 60),
      });
    });

    // Format muscle breakdown for charts
    const muscleDistribution = Object.keys(muscleFrequency).map((name) => ({
      name,
      value: muscleFrequency[name],
    }));

    // Calculate streak (days with workouts)
    let currentStreak = 0;
    if (workouts.length > 0) {
      const dates = [
        ...new Set(
          workouts.map((w) => new Date(w.date).toISOString().split('T')[0])
        ),
      ].sort().reverse();

      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (dates[0] === todayStr || dates[0] === yesterdayStr) {
        currentStreak = 1;
        let checkDate = new Date(dates[0]);
        for (let i = 1; i < dates.length; i++) {
          checkDate.setDate(checkDate.getDate() - 1);
          const expectedStr = checkDate.toISOString().split('T')[0];
          if (dates[i] === expectedStr) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    res.json({
      totalWorkouts,
      totalVolume,
      volumeThisWeek,
      totalPRs,
      currentStreak,
      averageDurationMinutes: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts / 60) : 0,
      recentWorkoutsChart,
      muscleDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get progress progression for a specific exercise over time
// @route   GET /api/stats/exercise/:exerciseName
// @access  Private
const getExerciseProgression = async (req, res) => {
  try {
    const { exerciseName } = req.params;
    const workouts = await Workout.find({
      user: req.user._id,
      'exercises.exerciseName': new RegExp(`^${exerciseName}$`, 'i'),
    }).sort({ date: 1 });

    const progressionData = [];

    workouts.forEach((w) => {
      const match = w.exercises.find(
        (e) => e.exerciseName.toLowerCase() === exerciseName.toLowerCase()
      );

      if (match && match.sets && match.sets.length > 0) {
        let maxWeight = 0;
        let max1RM = 0;
        let exerciseVolume = 0;

        match.sets.forEach((s) => {
          if (s.completed && s.type !== 'warmup') {
            if (s.weight > maxWeight) maxWeight = s.weight;
            const e1rm = s.estimated1RM || Math.round(s.weight * (1 + (s.reps || 0) / 30) * 10) / 10;
            if (e1rm > max1RM) max1RM = e1rm;
            exerciseVolume += (s.weight || 0) * (s.reps || 0);
          }
        });

        if (maxWeight > 0) {
          progressionData.push({
            date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
            rawDate: w.date,
            workoutTitle: w.title,
            maxWeight,
            estimated1RM: max1RM,
            volume: exerciseVolume,
            setsCount: match.sets.filter((s) => s.completed).length,
          });
        }
      }
    });

    res.json(progressionData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getExerciseProgression,
};

