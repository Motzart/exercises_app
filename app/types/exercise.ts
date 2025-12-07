export interface Exercise {
  id: string;
  name: string;
  favorite: boolean;
  description: string;
  user_id: string;
  created_at?: string;
}

export interface Session {
  id: string;
  created_at: string;
  exercise_id: string;
  user_id: string;
  start_at: string;
  end_at: string;
  duration_seconds: number;
}

export type CreateExerciseInput = Omit<Exercise, 'id' | 'created_at'>;
