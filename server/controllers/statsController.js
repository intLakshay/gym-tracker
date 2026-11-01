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

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    let volumeThisWeek = 0;

    workouts.forEach((w) => {
      // Calculate volume safely even if totalVolume was saved as 0
      let wVolume = Number(w.totalVolume) || 0;
      if (wVolume === 0 && w.exercises && w.exercises.length > 0) {
        w.exercises.forEach((ex) => {
          ex.sets?.forEach((s) => {
            if (s.type !== 'warmup') {
              wVolume += (Number(s.weight) || 0) * (Number(s.reps) || 0);
            }
          });
        });
      }

      totalVolume += wVolume;
      totalDuration += Number(w.duration) || 0;
      if (w.prsAchieved && w.prsAchieved.length > 0) {
        totalPRs += w.prsAchieved.length;
      }

      if (new Date(w.date) >= oneWeekAgo) {
        volumeThisWeek += wVolume;
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
      let wVolume = Number(w.totalVolume) || 0;
      if (wVolume === 0 && w.exercises) {
        w.exercises.forEach((ex) => {
          ex.sets?.forEach((s) => {
            if (s.type !== 'warmup') {
              wVolume += (Number(s.weight) || 0) * (Number(s.reps) || 0);
            }
          });
        });
      }

      recentWorkoutsChart.push({
        date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        title: w.title,
        volume: wVolume,
        durationMin: Math.round((Number(w.duration) || 0) / 60),
      });
    });

    const muscleDistribution = Object.keys(muscleFrequency).map((name) => ({
      name,
      value: muscleFrequency[name],
    }));

    // Calculate streak
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
        let completedCount = 0;

        match.sets.forEach((s) => {
          const isDone = s.completed !== false || (Number(s.weight) > 0 && Number(s.reps) > 0);
          if (isDone && s.type !== 'warmup') {
            const sw = Number(s.weight) || 0;
            const sr = Number(s.reps) || 0;
            if (sw > maxWeight) maxWeight = sw;
            const e1rm = s.estimated1RM || (sr > 0 ? Math.round(sw * (1 + sr / 30) * 10) / 10 : sw);
            if (e1rm > max1RM) max1RM = e1rm;
            exerciseVolume += sw * sr;
            completedCount++;
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
            setsCount: completedCount || match.sets.length,
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
