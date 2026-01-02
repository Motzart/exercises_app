import { supabaseClient } from '~/lib/supabaseClient';
import type {
  CreateExerciseInput,
  CreateNoteInput,
  CreateSessionInput,
  DaySessions,
  Exercise,
  ExerciseDayStats,
  Note,
  Session,
} from '~/types/exercise';

async function getCurrentUserId(): Promise<string> {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  return session.user.id;
}

export async function createExercise(exercise: CreateExerciseInput) {
  const { data, error } = await supabaseClient
    .from('exercises')
    .insert(exercise);

  if (error) {
    throw new Error(error.message || 'Failed to create exercises');
  }

  return data;
}

export async function createSession(session: CreateSessionInput) {
  const { data, error } = await supabaseClient.from('sessions').insert(session);

  if (error) {
    throw new Error(error.message || 'Failed to create session');
  }

  return data;
}

export async function getExercises(filters?: { favorite?: boolean }) {
  const userId = await getCurrentUserId();

  let query = supabaseClient
    .from('exercises')
    .select(
      `
      *,
      sessions!left(
        id,
        created_at,
        started_at,
        ended_at,
        duration_seconds
      )
    `,
    )
    .eq('user_id', userId)
    .order('created_at', { foreignTable: 'sessions', ascending: false })
    .limit(1, { foreignTable: 'sessions' });

  if (filters?.favorite !== undefined) {
    query = query.eq('favorite', filters.favorite);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error };
  }

  const processedData =
    data?.map((exercise) => {
      // sessions может быть массивом (если limit не сработал) или объектом/null
      const sessions = exercise.sessions as Array<Session> | Session | null;

      let lastSession: Session | null = null;
      if (Array.isArray(sessions)) {
        lastSession = sessions.length > 0 ? sessions[0] : null;
      } else if (sessions && typeof sessions === 'object') {
        lastSession = sessions as Session;
      }

      // Удаляем временное поле sessions и добавляем lastSession
      const { sessions: _, ...exerciseWithoutSessions } = exercise;
      return {
        ...exerciseWithoutSessions,
        lastSession,
      } as Exercise;
    }) || null;

  return { data: processedData, error: null };
}

export async function getExercisesByIds(exerciseIds: string[]) {
  if (!exerciseIds || exerciseIds.length === 0) {
    return { data: [], error: null };
  }

  const userId = await getCurrentUserId();

  const { data, error } = await supabaseClient
    .from('exercises')
    .select(
      `
      *,
      sessions!left(
        id,
        created_at,
        started_at,
        ended_at,
        duration_seconds
      )
    `,
    )
    .eq('user_id', userId)
    .in('id', exerciseIds)
    .order('created_at', { foreignTable: 'sessions', ascending: false })
    .limit(1, { foreignTable: 'sessions' });

  if (error) {
    return { data: null, error };
  }

  // Сохраняем порядок из exerciseIds
  const exerciseMap = new Map(
    data?.map((exercise) => {
      const sessions = exercise.sessions as Array<Session> | Session | null;
      let lastSession: Session | null = null;
      if (Array.isArray(sessions)) {
        lastSession = sessions.length > 0 ? sessions[0] : null;
      } else if (sessions && typeof sessions === 'object') {
        lastSession = sessions as Session;
      }

      const { sessions: _, ...exerciseWithoutSessions } = exercise;
      return [
        exercise.id,
        {
          ...exerciseWithoutSessions,
          lastSession,
        } as Exercise,
      ];
    }) || [],
  );

  const processedData = exerciseIds
    .map((id) => exerciseMap.get(id))
    .filter((exercise): exercise is Exercise => exercise !== undefined);

  return { data: processedData, error: null };
}

export async function setFavoriteItem(exerciseId: string, isFavorite: boolean) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabaseClient
    .from('exercises')
    .update({ favorite: isFavorite })
    .eq('id', exerciseId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message || 'Failed to set favorite exercise');
  }

  return data;
}

export async function getTotalDurationSeconds() {
  const userId = await getCurrentUserId();

  // Use SQL aggregation SUM() on the database side via RPC function
  // This will be faster for large volumes of data (1000+ records)
  const { data: rpcData, error: rpcError } = await supabaseClient.rpc(
    'get_total_duration_seconds',
    { p_user_id: userId },
  );

  // If RPC function exists and returned a result, use it
  if (!rpcError && rpcData !== null && rpcData !== undefined) {
    return rpcData;
  }

  // Fallback: if RPC function is not created, use client-side aggregation
  // For optimization, it's recommended to create RPC function in Supabase SQL Editor:
  // CREATE OR REPLACE FUNCTION get_total_duration_seconds(p_user_id UUID)
  // RETURNS INTEGER AS $$
  // BEGIN
  //   RETURN COALESCE(SUM(duration_seconds), 0)::INTEGER
  //   FROM sessions
  //   WHERE user_id = p_user_id;
  // END;
  // $$ LANGUAGE plpgsql SECURITY DEFINER;
  const { data, error } = await supabaseClient
    .from('sessions')
    .select('duration_seconds')
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message || 'Failed to get total duration');
  }

  if (!data || data.length === 0) {
    return 0;
  }

  const totalSeconds = data.reduce(
    (sum, session) => sum + (session.duration_seconds || 0),
    0,
  );
  return totalSeconds;
}

export async function getTodayDurationSeconds() {
  const userId = await getCurrentUserId();

  // Use SQL aggregation SUM() on the database side via RPC function
  // This will be faster for large volumes of data (1000+ records)
  const { data: rpcData, error: rpcError } = await supabaseClient.rpc(
    'get_today_duration_seconds',
    { p_user_id: userId },
  );

  // If RPC function exists and returned a result, use it
  if (!rpcError && rpcData !== null && rpcData !== undefined) {
    return rpcData;
  }

  // Fallback: if RPC function is not created, use client-side aggregation
  // For optimization, it's recommended to create RPC function in Supabase SQL Editor
  // Get start and end of today in UTC for consistency with database timezone
  const now = new Date();
  const todayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const startOfToday = todayUTC.toISOString();

  const endOfTodayUTC = new Date(todayUTC);
  endOfTodayUTC.setUTCHours(23, 59, 59, 999);
  const endOfTodayISO = endOfTodayUTC.toISOString();

  const { data, error } = await supabaseClient
    .from('sessions')
    .select('duration_seconds')
    .eq('user_id', userId)
    .gte('created_at', startOfToday)
    .lte('created_at', endOfTodayISO);

  if (error) {
    throw new Error(error.message || 'Failed to get today duration');
  }

  if (!data || data.length === 0) {
    return 0;
  }

  const totalSeconds = data.reduce(
    (sum, session) => sum + (session.duration_seconds || 0),
    0,
  );
  return totalSeconds;
}

export async function getYesterdayDurationSeconds() {
  const userId = await getCurrentUserId();

  // Get start and end of yesterday in UTC for consistency with database timezone
  const now = new Date();
  const yesterdayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1),
  );
  const startOfYesterday = yesterdayUTC.toISOString();

  const endOfYesterdayUTC = new Date(yesterdayUTC);
  endOfYesterdayUTC.setUTCHours(23, 59, 59, 999);
  const endOfYesterdayISO = endOfYesterdayUTC.toISOString();

  const { data, error } = await supabaseClient
    .from('sessions')
    .select('duration_seconds')
    .eq('user_id', userId)
    .gte('created_at', startOfYesterday)
    .lte('created_at', endOfYesterdayISO);

  if (error) {
    throw new Error(error.message || 'Failed to get yesterday duration');
  }

  if (!data || data.length === 0) {
    return 0;
  }

  const totalSeconds = data.reduce(
    (sum, session) => sum + (session.duration_seconds || 0),
    0,
  );
  return totalSeconds;
}

export async function getThisWeekDurationSeconds() {
  const userId = await getCurrentUserId();

  // Use SQL aggregation SUM() on the database side via RPC function
  const { data: rpcData, error: rpcError } = await supabaseClient.rpc(
    'get_this_week_duration_seconds',
    { p_user_id: userId },
  );

  // If RPC function exists and returned a result, use it
  if (!rpcError && rpcData !== null && rpcData !== undefined) {
    return rpcData;
  }

  // Fallback: client-side aggregation
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfWeekISO = startOfWeek.toISOString();

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  const endOfWeekISO = endOfWeek.toISOString();

  const { data, error } = await supabaseClient
    .from('sessions')
    .select('duration_seconds')
    .eq('user_id', userId)
    .gte('created_at', startOfWeekISO)
    .lte('created_at', endOfWeekISO);

  if (error) {
    throw new Error(error.message || 'Failed to get this week duration');
  }

  if (!data || data.length === 0) {
    return 0;
  }

  const totalSeconds = data.reduce(
    (sum, session) => sum + (session.duration_seconds || 0),
    0,
  );
  return totalSeconds;
}

export async function getLastWeekDurationSeconds() {
  const userId = await getCurrentUserId();

  // Use SQL aggregation SUM() on the database side via RPC function
  const { data: rpcData, error: rpcError } = await supabaseClient.rpc(
    'get_last_week_duration_seconds',
    { p_user_id: userId },
  );

  // If RPC function exists and returned a result, use it
  if (!rpcError && rpcData !== null && rpcData !== undefined) {
    return rpcData;
  }

  // Fallback: client-side aggregation
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfCurrentWeek = new Date(now);
  startOfCurrentWeek.setDate(
    now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1),
  );
  startOfCurrentWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfCurrentWeek);
  startOfLastWeek.setDate(startOfCurrentWeek.getDate() - 7);
  const startOfLastWeekISO = startOfLastWeek.toISOString();

  const endOfLastWeek = new Date(startOfCurrentWeek);
  endOfLastWeek.setDate(startOfCurrentWeek.getDate() - 1);
  endOfLastWeek.setHours(23, 59, 59, 999);
  const endOfLastWeekISO = endOfLastWeek.toISOString();

  const { data, error } = await supabaseClient
    .from('sessions')
    .select('duration_seconds')
    .eq('user_id', userId)
    .gte('created_at', startOfLastWeekISO)
    .lte('created_at', endOfLastWeekISO);

  if (error) {
    throw new Error(error.message || 'Failed to get last week duration');
  }

  if (!data || data.length === 0) {
    return 0;
  }

  const totalSeconds = data.reduce(
    (sum, session) => sum + (session.duration_seconds || 0),
    0,
  );
  return totalSeconds;
}

export async function getThisMonthDurationSeconds() {
  const userId = await getCurrentUserId();

  // Use SQL aggregation SUM() on the database side via RPC function
  const { data: rpcData, error: rpcError } = await supabaseClient.rpc(
    'get_this_month_duration_seconds',
    { p_user_id: userId },
  );

  // If RPC function exists and returned a result, use it
  if (!rpcError && rpcData !== null && rpcData !== undefined) {
    return rpcData;
  }

  // Fallback: client-side aggregation
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startOfMonthISO = startOfMonth.toISOString();

  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  const endOfMonthISO = endOfMonth.toISOString();

  const { data, error } = await supabaseClient
    .from('sessions')
    .select('duration_seconds')
    .eq('user_id', userId)
    .gte('created_at', startOfMonthISO)
    .lte('created_at', endOfMonthISO);

  if (error) {
    throw new Error(error.message || 'Failed to get this month duration');
  }

  if (!data || data.length === 0) {
    return 0;
  }

  const totalSeconds = data.reduce(
    (sum, session) => sum + (session.duration_seconds || 0),
    0,
  );
  return totalSeconds;
}

export async function getLastMonthDurationSeconds() {
  const userId = await getCurrentUserId();

  // Use SQL aggregation SUM() on the database side via RPC function
  const { data: rpcData, error: rpcError } = await supabaseClient.rpc(
    'get_last_month_duration_seconds',
    { p_user_id: userId },
  );

  // If RPC function exists and returned a result, use it
  if (!rpcError && rpcData !== null && rpcData !== undefined) {
    return rpcData;
  }

  // Fallback: client-side aggregation
  const now = new Date();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  startOfLastMonth.setHours(0, 0, 0, 0);
  const startOfLastMonthISO = startOfLastMonth.toISOString();

  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  endOfLastMonth.setHours(23, 59, 59, 999);
  const endOfLastMonthISO = endOfLastMonth.toISOString();

  const { data, error } = await supabaseClient
    .from('sessions')
    .select('duration_seconds')
    .eq('user_id', userId)
    .gte('created_at', startOfLastMonthISO)
    .lte('created_at', endOfLastMonthISO);

  if (error) {
    throw new Error(error.message || 'Failed to get last month duration');
  }

  if (!data || data.length === 0) {
    return 0;
  }

  const totalSeconds = data.reduce(
    (sum, session) => sum + (session.duration_seconds || 0),
    0,
  );
  return totalSeconds;
}

export async function getExercisesCount() {
  const userId = await getCurrentUserId();

  // Use SQL COUNT() on the database side for better performance
  const { count, error } = await supabaseClient
    .from('exercises')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message || 'Failed to get exercises count');
  }

  return count || 0;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours}г. ${String(minutes).padStart(2, '0')}хв.`;
}

export interface ExerciseWeekStats {
  exerciseId: string;
  exerciseName: string;
  durationMinutes: number;
}

export async function getExercisesWeekStats(): Promise<ExerciseWeekStats[]> {
  const userId = await getCurrentUserId();

  // Get start of current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfWeekISO = startOfWeek.toISOString();

  // Get end of current week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  const endOfWeekISO = endOfWeek.toISOString();

  // Get all sessions for this week with exercise info
  const { data: sessions, error } = await supabaseClient
    .from('sessions')
    .select(
      `
      exercise_id,
      duration_seconds,
      exercises!inner(
        id,
        name
      )
    `,
    )
    .eq('user_id', userId)
    .gte('created_at', startOfWeekISO)
    .lte('created_at', endOfWeekISO);

  if (error) {
    throw new Error(error.message || 'Failed to get exercises week stats');
  }

  if (!sessions || sessions.length === 0) {
    return [];
  }

  // Group by exercise and sum duration
  const statsMap = new Map<string, { name: string; totalSeconds: number }>();

  sessions.forEach((session: any) => {
    const exerciseId = session.exercise_id;
    const exerciseName = session.exercises?.name || 'Unknown';
    const durationSeconds = session.duration_seconds || 0;

    if (statsMap.has(exerciseId)) {
      const existing = statsMap.get(exerciseId)!;
      existing.totalSeconds += durationSeconds;
    } else {
      statsMap.set(exerciseId, {
        name: exerciseName,
        totalSeconds: durationSeconds,
      });
    }
  });

  // Convert to array and format
  const stats: ExerciseWeekStats[] = Array.from(statsMap.entries()).map(
    ([exerciseId, { name, totalSeconds }]) => ({
      exerciseId,
      exerciseName: name,
      durationMinutes: Math.round(totalSeconds / 60), // Round to whole minutes
    }),
  );

  // Sort by duration descending
  return stats.sort((a, b) => b.durationMinutes - a.durationMinutes);
}

export async function getSessionsByDay(): Promise<DaySessions[]> {
  const userId = await getCurrentUserId();

  // Get all sessions with exercise info, ordered by date descending
  const { data: sessions, error } = await supabaseClient
    .from('sessions')
    .select(
      `
      created_at,
      duration_seconds,
      exercises!inner(
        id,
        name
      )
    `,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Failed to get sessions by day');
  }

  if (!sessions || sessions.length === 0) {
    return [];
  }

  // Group by day and then by exercise
  const daysMap = new Map<
    string,
    Map<string, { name: string; totalSeconds: number }>
  >();

  sessions.forEach((session: any) => {
    const sessionDate = new Date(session.created_at);
    const dateKey = sessionDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const exerciseId = session.exercises?.id;
    const exerciseName = session.exercises?.name || 'Unknown';
    const durationSeconds = session.duration_seconds || 0;

    if (!daysMap.has(dateKey)) {
      daysMap.set(dateKey, new Map());
    }

    const exercisesMap = daysMap.get(dateKey)!;

    if (exercisesMap.has(exerciseId)) {
      const existing = exercisesMap.get(exerciseId)!;
      existing.totalSeconds += durationSeconds;
    } else {
      exercisesMap.set(exerciseId, {
        name: exerciseName,
        totalSeconds: durationSeconds,
      });
    }
  });

  // Convert to array format
  const days: DaySessions[] = Array.from(daysMap.entries())
    .map(([dateTime, exercisesMap]) => {
      const exercises: ExerciseDayStats[] = Array.from(
        exercisesMap.values(),
      ).map(({ name, totalSeconds }) => ({
        exerciseName: name,
        totalDurationSeconds: totalSeconds,
      }));

      // Calculate total duration for the day
      const totalDurationSeconds = exercises.reduce(
        (sum, exercise) => sum + exercise.totalDurationSeconds,
        0,
      );

      // Format date for display
      const date = new Date(dateTime);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let displayDate = dateTime;
      if (date.toDateString() === today.toDateString()) {
        displayDate = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        displayDate = 'Yesterday';
      } else {
        displayDate = date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }

      return {
        date: displayDate,
        dateTime,
        totalDurationSeconds,
        exercises: exercises.sort(
          (a, b) => b.totalDurationSeconds - a.totalDurationSeconds,
        ),
      };
    })
    .sort((a, b) => b.dateTime.localeCompare(a.dateTime)); // Sort by date descending

  return days;
}

export interface SessionByDate {
  date: string; // YYYY-MM-DD format
  durationSeconds: number;
}

export async function getSessionsByDateRange(
  startDate: Date,
  endDate: Date,
): Promise<SessionByDate[]> {
  const userId = await getCurrentUserId();

  const startDateISO = new Date(startDate);
  startDateISO.setHours(0, 0, 0, 0);
  const startDateISOString = startDateISO.toISOString();

  const endDateISO = new Date(endDate);
  endDateISO.setHours(23, 59, 59, 999);
  const endDateISOString = endDateISO.toISOString();

  // Get sessions for the date range
  const { data: sessions, error } = await supabaseClient
    .from('sessions')
    .select('created_at, duration_seconds')
    .eq('user_id', userId)
    .gte('created_at', startDateISOString)
    .lte('created_at', endDateISOString)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Failed to get sessions by date range');
  }

  if (!sessions || sessions.length === 0) {
    return [];
  }

  // Group sessions by date
  const dateMap = new Map<string, number>();

  sessions.forEach((session: any) => {
    const sessionDate = new Date(session.created_at);
    const dateKey = sessionDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const durationSeconds = session.duration_seconds || 0;

    if (dateMap.has(dateKey)) {
      dateMap.set(dateKey, dateMap.get(dateKey)! + durationSeconds);
    } else {
      dateMap.set(dateKey, durationSeconds);
    }
  });

  // Convert to array and fill missing dates with 0
  const result: SessionByDate[] = [];
  const currentDate = new Date(startDateISO);
  const end = new Date(endDateISO);

  while (currentDate <= end) {
    const dateKey = currentDate.toISOString().split('T')[0];
    result.push({
      date: dateKey,
      durationSeconds: dateMap.get(dateKey) || 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
}

export async function getSessionsByDayOfWeek(): Promise<number[]> {
  const userId = await getCurrentUserId();

  // Get start of current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfWeekISO = startOfWeek.toISOString();

  // Get end of current week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  const endOfWeekISO = endOfWeek.toISOString();

  // Get sessions only for current week
  const { data: sessions, error } = await supabaseClient
    .from('sessions')
    .select('created_at, duration_seconds')
    .eq('user_id', userId)
    .gte('created_at', startOfWeekISO)
    .lte('created_at', endOfWeekISO);

  if (error) {
    throw new Error(error.message || 'Failed to get sessions by day of week');
  }

  // Initialize array for 7 days (Monday-Sunday)
  // Index 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];

  if (!sessions || sessions.length === 0) {
    return dayTotals;
  }

  sessions.forEach((session: any) => {
    const sessionDate = new Date(session.created_at);
    const dayOfWeek = sessionDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const durationSeconds = session.duration_seconds || 0;

    // Convert to Monday-Sunday index (0 = Monday, 6 = Sunday)
    // Sunday (0) becomes 6, Monday (1) becomes 0, etc.
    const mondayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    dayTotals[mondayIndex] += durationSeconds;
  });

  return dayTotals;
}

export async function createNote(note: CreateNoteInput) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabaseClient
    .from('notes')
    .insert({
      ...note,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to create note');
  }

  return data as Note;
}

export async function getNotes(exerciseId?: string | null): Promise<Note[]> {
  const userId = await getCurrentUserId();

  let query = supabaseClient
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (exerciseId) {
    query = query.eq('exercise_id', exerciseId);
  } else {
    query = query.is('exercise_id', null);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || 'Failed to get notes');
  }

  return (data as Note[]) || [];
}

export async function deleteNote(noteId: string) {
  const userId = await getCurrentUserId();

  const { error } = await supabaseClient
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message || 'Failed to delete note');
  }
}

export async function deleteExercise(exerciseId: string) {
  const userId = await getCurrentUserId();

  const { error } = await supabaseClient
    .from('exercises')
    .delete()
    .eq('id', exerciseId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message || 'Failed to delete exercise');
  }
}

export async function updateExercise(
  exerciseId: string,
  updates: Partial<
    Pick<
      Exercise,
      'name' | 'favorite' | 'description' | 'author' | 'estimated_time'
    >
  >,
) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabaseClient
    .from('exercises')
    .update(updates)
    .eq('id', exerciseId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to update exercise');
  }

  return data as Exercise;
}

export interface CreatePlaylistInput {
  name: string;
  exercise_ids: string[];
}

export interface Playlist {
  id: string;
  name: string;
  user_id: string;
  exercise_ids: string[];
  created_at: string;
}

export interface PlaylistWithCount extends Playlist {
  exercise_count: number;
}

export async function createPlaylist(playlist: CreatePlaylistInput) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabaseClient
    .from('playlists')
    .insert({
      name: playlist.name,
      exercise_ids: playlist.exercise_ids,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to create playlist');
  }

  return data;
}

export async function getPlaylists() {
  const userId = await getCurrentUserId();

  const { data, error } = await supabaseClient
    .from('playlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Failed to get playlists');
  }

  // Calculate exercise count for each playlist
  const playlistsWithCount: PlaylistWithCount[] =
    data?.map((playlist) => ({
      ...playlist,
      exercise_count: playlist.exercise_ids?.length || 0,
    })) || [];

  return playlistsWithCount;
}

export async function getPlaylistById(playlistId: string) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabaseClient
    .from('playlists')
    .select('*')
    .eq('id', playlistId)
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to get playlist');
  }

  if (!data) {
    throw new Error('Playlist not found');
  }

  return {
    ...data,
    exercise_count: data.exercise_ids?.length || 0,
  } as PlaylistWithCount;
}

export async function deletePlaylist(playlistId: string) {
  const userId = await getCurrentUserId();

  const { error } = await supabaseClient
    .from('playlists')
    .delete()
    .eq('id', playlistId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message || 'Failed to delete playlist');
  }
}

export interface TopExercise {
  exerciseId: string;
  exerciseName: string;
  totalDurationSeconds: number;
  sessionCount: number;
}

export async function getTopExercisesByTime(
  limit: number = 10,
  startDate?: Date,
  endDate?: Date,
): Promise<TopExercise[]> {
  const userId = await getCurrentUserId();

  let query = supabaseClient
    .from('sessions')
    .select(
      `
      exercise_id,
      duration_seconds,
      exercises!inner(
        id,
        name
      )
    `,
    )
    .eq('user_id', userId);

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  if (endDate) {
    const endDateISO = new Date(endDate);
    endDateISO.setHours(23, 59, 59, 999);
    query = query.lte('created_at', endDateISO.toISOString());
  }

  const { data: sessions, error } = await query;

  if (error) {
    throw new Error(error.message || 'Failed to get top exercises');
  }

  if (!sessions || sessions.length === 0) {
    return [];
  }

  // Group by exercise and calculate totals
  const exerciseMap = new Map<
    string,
    { name: string; totalSeconds: number; count: number }
  >();

  sessions.forEach((session: any) => {
    const exerciseId = session.exercise_id;
    const exerciseName = session.exercises?.name || 'Unknown';
    const durationSeconds = session.duration_seconds || 0;

    if (exerciseMap.has(exerciseId)) {
      const existing = exerciseMap.get(exerciseId)!;
      existing.totalSeconds += durationSeconds;
      existing.count += 1;
    } else {
      exerciseMap.set(exerciseId, {
        name: exerciseName,
        totalSeconds: durationSeconds,
        count: 1,
      });
    }
  });

  // Convert to array and sort by total duration
  const topExercises: TopExercise[] = Array.from(exerciseMap.entries())
    .map(([exerciseId, { name, totalSeconds, count }]) => ({
      exerciseId,
      exerciseName: name,
      totalDurationSeconds: totalSeconds,
      sessionCount: count,
    }))
    .sort((a, b) => b.totalDurationSeconds - a.totalDurationSeconds)
    .slice(0, limit);

  return topExercises;
}

export async function getAverageSessionDuration(
  startDate?: Date,
  endDate?: Date,
): Promise<number> {
  const userId = await getCurrentUserId();

  let query = supabaseClient
    .from('sessions')
    .select('duration_seconds')
    .eq('user_id', userId);

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  if (endDate) {
    const endDateISO = new Date(endDate);
    endDateISO.setHours(23, 59, 59, 999);
    query = query.lte('created_at', endDateISO.toISOString());
  }

  const { data: sessions, error } = await query;

  if (error) {
    throw new Error(error.message || 'Failed to get average session duration');
  }

  if (!sessions || sessions.length === 0) {
    return 0;
  }

  const totalSeconds = sessions.reduce(
    (sum, session) => sum + (session.duration_seconds || 0),
    0,
  );

  return Math.round(totalSeconds / sessions.length);
}

export async function getPracticeDaysCount(
  startDate: Date,
  endDate: Date,
): Promise<number> {
  const userId = await getCurrentUserId();

  const startDateISO = new Date(startDate);
  startDateISO.setHours(0, 0, 0, 0);
  const startDateISOString = startDateISO.toISOString();

  const endDateISO = new Date(endDate);
  endDateISO.setHours(23, 59, 59, 999);
  const endDateISOString = endDateISO.toISOString();

  const { data: sessions, error } = await supabaseClient
    .from('sessions')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', startDateISOString)
    .lte('created_at', endDateISOString);

  if (error) {
    throw new Error(error.message || 'Failed to get practice days count');
  }

  if (!sessions || sessions.length === 0) {
    return 0;
  }

  // Get unique dates
  const uniqueDates = new Set<string>();
  sessions.forEach((session: any) => {
    const sessionDate = new Date(session.created_at);
    const dateKey = sessionDate.toISOString().split('T')[0];
    uniqueDates.add(dateKey);
  });

  return uniqueDates.size;
}

export async function getPracticeStreak(): Promise<number> {
  const userId = await getCurrentUserId();

  // Get all sessions ordered by date descending
  const { data: sessions, error } = await supabaseClient
    .from('sessions')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Failed to get practice streak');
  }

  if (!sessions || sessions.length === 0) {
    return 0;
  }

  // Get unique dates
  const uniqueDates = new Set<string>();
  sessions.forEach((session: any) => {
    const sessionDate = new Date(session.created_at);
    const dateKey = sessionDate.toISOString().split('T')[0];
    uniqueDates.add(dateKey);
  });

  // Sort dates descending
  const sortedDates = Array.from(uniqueDates).sort((a, b) =>
    b.localeCompare(a),
  );

  // Check if today or yesterday is in the list
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split('T')[0];

  // If today is not in the list, start from yesterday
  let currentDate = sortedDates.includes(todayKey) ? today : yesterday;
  let streak = 0;
  let checkDate = new Date(currentDate);

  // Count consecutive days
  for (let i = 0; i < sortedDates.length; i++) {
    const checkDateKey = checkDate.toISOString().split('T')[0];

    if (sortedDates.includes(checkDateKey)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
