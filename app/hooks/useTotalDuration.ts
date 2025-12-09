import { useQuery } from '@tanstack/react-query';
import {
  formatDuration,
  getTotalDurationSeconds,
  getTodayDurationSeconds,
  getExercisesCount,
  getExercisesWeekStats,
  type ExerciseWeekStats,
} from '~/services/superbaseDb';

export function useTotalDuration() {
  return useQuery({
    queryKey: ['totalDuration'],
    queryFn: async () => {
      const totalSeconds = await getTotalDurationSeconds();
      return formatDuration(totalSeconds);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTodayDuration() {
  return useQuery({
    queryKey: ['todayDuration'],
    queryFn: async () => {
      const totalSeconds = await getTodayDurationSeconds();
      return formatDuration(totalSeconds);
    },
    staleTime: 1 * 60 * 1000, // 1 minute (more frequent updates for today's data)
  });
}

export function useExercisesCount() {
  return useQuery({
    queryKey: ['exercisesCount'],
    queryFn: async () => {
      return await getExercisesCount();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useExercisesWeekStats() {
  return useQuery<ExerciseWeekStats[]>({
    queryKey: ['exercisesWeekStats'],
    queryFn: async () => {
      return await getExercisesWeekStats();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
