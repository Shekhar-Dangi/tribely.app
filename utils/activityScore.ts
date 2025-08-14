// Utility to calculate activity score for a WorkoutLog
import { WorkoutLog } from "../components/workouts/WorkoutText";

export function calculateActivityScore(workoutLog: WorkoutLog): number {
  let score = 0;

  // Resistance: score by total volume (sum of weight * reps for all sets)
  if (workoutLog.resistanceDetails && workoutLog.resistanceDetails.length > 0) {
    for (const rd of workoutLog.resistanceDetails) {
      for (let i = 0; i < rd.sets; i++) {
        score += (rd.weight[i] || 0) * (rd.reps[i] || 0) * 0.1; // 0.1 is a scaling factor
      }
    }
  }

  // Cardio: score by distance and duration
  if (workoutLog.cardioDetails && workoutLog.cardioDetails.length > 0) {
    for (const cd of workoutLog.cardioDetails) {
      let cardioScore = 0;
      if (cd.distance && cd.duration) {
        cardioScore = cd.distance * 2 + cd.duration * 1.5; // weighted sum
      } else if (cd.distance) {
        cardioScore = cd.distance * 2.5;
      } else if (cd.duration) {
        cardioScore = cd.duration * 2;
      }
      score += cardioScore;
    }
  }

  // Mobility: score by duration
  if (workoutLog.mobilityDetails && workoutLog.mobilityDetails.length > 0) {
    for (const md of workoutLog.mobilityDetails) {
      score += md.duration * 1.2;
    }
  }

  return Math.round(score);
}
