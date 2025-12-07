import { supabaseClient } from '~/lib/supabaseClient';
import type {
  CreateExerciseInput,
  CreateSessionInput,
  Exercise,
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
  const { data, error } = await supabaseClient
    .from('sessions')
    .insert(session);

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
