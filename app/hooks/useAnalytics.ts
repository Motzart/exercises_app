import { useQuery } from '@tanstack/react-query'
import {
  getTopExercisesByTime,
  getAverageSessionDuration,
  getPracticeDaysCount,
  getPracticeStreak,
  formatDuration,
  type TopExercise,
} from '~/services/superbaseDb'

export function useTopExercises(
  limit: number = 10,
  startDate?: Date,
  endDate?: Date,
) {
  return useQuery<TopExercise[]>({
    queryKey: ['topExercises', limit, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      return await getTopExercisesByTime(limit, startDate, endDate)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAverageSessionDuration(
  startDate?: Date,
  endDate?: Date,
) {
  return useQuery<number>({
    queryKey: ['averageSessionDuration', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      return await getAverageSessionDuration(startDate, endDate)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function usePracticeDaysCount(startDate: Date, endDate: Date) {
  return useQuery<number>({
    queryKey: ['practiceDaysCount', startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      return await getPracticeDaysCount(startDate, endDate)
    },
    enabled: startDate <= endDate, // Only run if dates are valid
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function usePracticeStreak() {
  return useQuery<number>({
    queryKey: ['practiceStreak'],
    queryFn: async () => {
      return await getPracticeStreak()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAverageSessionDurationFormatted(
  startDate?: Date,
  endDate?: Date,
) {
  const { data: seconds, ...rest } = useAverageSessionDuration(startDate, endDate)
  
  return {
    ...rest,
    data: seconds ? formatDuration(seconds) : undefined,
  }
}

