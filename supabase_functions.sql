-- SQL функция для получения общей длительности сессий пользователя
-- Выполните этот запрос в Supabase SQL Editor для оптимизации запросов
-- Это позволит выполнять агрегацию SUM() на стороне базы данных вместо клиента

CREATE OR REPLACE FUNCTION get_total_duration_seconds(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(SUM(duration_seconds), 0)::INTEGER
  FROM sessions
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SQL функция для получения длительности сессий пользователя за сегодняшний день
-- Выполните этот запрос в Supabase SQL Editor для оптимизации запросов

CREATE OR REPLACE FUNCTION get_today_duration_seconds(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(SUM(duration_seconds), 0)::INTEGER
  FROM sessions
  WHERE user_id = p_user_id
    AND DATE(created_at AT TIME ZONE 'UTC') = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Предоставляем права на выполнение функций для аутентифицированных пользователей
GRANT EXECUTE ON FUNCTION get_total_duration_seconds(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_today_duration_seconds(UUID) TO authenticated;

-- Создание таблицы notes для хранения заметок пользователей
-- Выполните этот запрос в Supabase SQL Editor для создания таблицы
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS notes_exercise_id_idx ON notes(exercise_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at DESC);

-- Включение Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Политика безопасности: пользователи могут видеть только свои заметки
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

-- Политика безопасности: пользователи могут создавать свои заметки
CREATE POLICY "Users can create their own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Политика безопасности: пользователи могут обновлять свои заметки
CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

-- Политика безопасности: пользователи могут удалять свои заметки
CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- Политика безопасности: пользователи могут обновлять свои упражнения
CREATE POLICY "Users can update their own exercises"
  ON exercises FOR UPDATE
  USING (auth.uid() = user_id);

-- Политика безопасности: пользователи могут удалять свои упражнения
CREATE POLICY "Users can delete their own exercises"
  ON exercises FOR DELETE
  USING (auth.uid() = user_id);
