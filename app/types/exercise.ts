export interface Exercise {
  id: string;
  name: string;
  author: string;
  estimated_time: number;
  favorite: boolean;
  description: string;
  user_id: string;
  created_at?: string;
  lastSession?: Session | null;
}

export interface Session {
  id: string;
  created_at: string;
  exercise_id: string;
  user_id: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
}

export interface PlayList {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  exercises: Exercise[];
}

export type CreateSessionInput = Omit<Session, 'id' | 'created_at' | 'user_id'>;
export type CreateExerciseInput = Omit<Exercise, 'id' | 'created_at'>;

export interface ExerciseDayStats {
  exerciseName: string;
  totalDurationSeconds: number;
}

export interface DaySessions {
  date: string;
  dateTime: string;
  totalDurationSeconds: number;
  exercises: ExerciseDayStats[];
}

export interface Note {
  id: string;
  content: string;
  user_id: string;
  exercise_id: string | null;
  created_at: string;
}

export type CreateNoteInput = Omit<Note, 'id' | 'created_at' | 'user_id'>;

export interface Item {
  id: string;
  name: string;
}
