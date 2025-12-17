import { useQuery } from '@tanstack/react-query';
import {
  formatDuration,
  getTotalDurationSeconds,
  getTodayDurationSeconds,
  getExercisesCount,
  getExercisesWeekStats,
  getThisWeekDurationSeconds,
  getLastWeekDurationSeconds,
  getThisMonthDurationSeconds,
  getLastMonthDurationSeconds,
  getSessionsByDayOfWeek,
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

export function useSessionsByDayOfWeek() {
  return useQuery<number[]>({
    queryKey: ['sessionsByDayOfWeek'],
    queryFn: async () => {
      return await getSessionsByDayOfWeek();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

function formatDateRange(startDate: Date, endDate: Date): string {
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const startMonth = startDate.toLocaleDateString('uk-UA', { month: 'long' });
  const endMonth = endDate.toLocaleDateString('uk-UA', { month: 'long' });

  if (startMonth === endMonth) {
    return `${startDay}-${endDay} ${startMonth}`;
  }
  return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
}

function getWeekDates(): {
  thisWeek: { start: Date; end: Date };
  lastWeek: { start: Date; end: Date };
} {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // Початок поточного тижня (понеділок)
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(
    now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1),
  );
  startOfThisWeek.setHours(0, 0, 0, 0);

  // Кінець поточного тижня (неділя)
  const endOfThisWeek = new Date(startOfThisWeek);
  endOfThisWeek.setDate(startOfThisWeek.getDate() + 6);
  endOfThisWeek.setHours(23, 59, 59, 999);

  // Початок минулого тижня
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

  // Кінець минулого тижня
  const endOfLastWeek = new Date(startOfThisWeek);
  endOfLastWeek.setDate(startOfThisWeek.getDate() - 1);
  endOfLastWeek.setHours(23, 59, 59, 999);

  return {
    thisWeek: { start: startOfThisWeek, end: endOfThisWeek },
    lastWeek: { start: startOfLastWeek, end: endOfLastWeek },
  };
}

function getMonthDates(): {
  thisMonth: { start: Date; end: Date };
  lastMonth: { start: Date; end: Date };
} {
  const now = new Date();

  // Початок поточного місяця
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Кінець поточного місяця
  const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endOfThisMonth.setHours(23, 59, 59, 999);

  // Початок минулого місяця
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Кінець минулого місяця
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  endOfLastMonth.setHours(23, 59, 59, 999);

  return {
    thisMonth: { start: startOfThisMonth, end: endOfThisMonth },
    lastMonth: { start: startOfLastMonth, end: endOfLastMonth },
  };
}

export interface PeriodStats {
  thisWeek: string;
  lastWeek: string;
  thisMonth: string;
  lastMonth: string;
  thisWeekDate: string;
  lastWeekDate: string;
  thisMonthDate: string;
  lastMonthDate: string;
}

export function usePeriodStats() {
  return useQuery<PeriodStats>({
    queryKey: ['periodStats'],
    queryFn: async () => {
      const [thisWeek, lastWeek, thisMonth, lastMonth] = await Promise.all([
        getThisWeekDurationSeconds(),
        getLastWeekDurationSeconds(),
        getThisMonthDurationSeconds(),
        getLastMonthDurationSeconds(),
      ]);

      const weekDates = getWeekDates();
      const monthDates = getMonthDates();

      return {
        thisWeek: formatDuration(thisWeek),
        lastWeek: formatDuration(lastWeek),
        thisMonth: formatDuration(thisMonth),
        lastMonth: formatDuration(lastMonth),
        thisWeekDate: formatDateRange(
          weekDates.thisWeek.start,
          weekDates.thisWeek.end,
        ),
        lastWeekDate: formatDateRange(
          weekDates.lastWeek.start,
          weekDates.lastWeek.end,
        ),
        thisMonthDate: formatDateRange(
          monthDates.thisMonth.start,
          monthDates.thisMonth.end,
        ),
        lastMonthDate: formatDateRange(
          monthDates.lastMonth.start,
          monthDates.lastMonth.end,
        ),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
