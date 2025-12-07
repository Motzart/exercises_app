import { supabaseClient } from '~/lib/supabaseClient';
import type { CreateExerciseInput } from '~/types/exercise';

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

export async function getExercises(filters?: { favorite?: boolean }) {
  const userId = await getCurrentUserId();

  let query = supabaseClient
    .from('exercises')
    .select('*')
    .eq('user_id', userId);

  if (filters?.favorite !== undefined) {
    query = query.eq('favorite', filters.favorite);
  }

  const { data, error } = await query;

  return { data, error };
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
