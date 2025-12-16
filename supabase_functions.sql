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

-- SQL функция для получения длительности сессий пользователя за текущий тиждень (понедельник-воскресенье)
CREATE OR REPLACE FUNCTION get_this_week_duration_seconds(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_start_of_week TIMESTAMP WITH TIME ZONE;
  v_end_of_week TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Начало текущей недели (понедельник 00:00:00)
  v_start_of_week := DATE_TRUNC('week', CURRENT_DATE AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';
  -- Конец текущей недели (воскресенье 23:59:59)
  v_end_of_week := (DATE_TRUNC('week', CURRENT_DATE AT TIME ZONE 'UTC') + INTERVAL '6 days 23 hours 59 minutes 59 seconds') AT TIME ZONE 'UTC';
  
  RETURN COALESCE(SUM(duration_seconds), 0)::INTEGER
  FROM sessions
  WHERE user_id = p_user_id
    AND created_at >= v_start_of_week
    AND created_at <= v_end_of_week;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SQL функция для получения длительности сессий пользователя за прошлый тиждень
CREATE OR REPLACE FUNCTION get_last_week_duration_seconds(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_start_of_last_week TIMESTAMP WITH TIME ZONE;
  v_end_of_last_week TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Начало прошлой недели (понедельник 00:00:00)
  v_start_of_last_week := (DATE_TRUNC('week', CURRENT_DATE AT TIME ZONE 'UTC') - INTERVAL '7 days') AT TIME ZONE 'UTC';
  -- Конец прошлой недели (воскресенье 23:59:59)
  v_end_of_last_week := (DATE_TRUNC('week', CURRENT_DATE AT TIME ZONE 'UTC') - INTERVAL '1 day 23 hours 59 minutes 59 seconds') AT TIME ZONE 'UTC';
  
  RETURN COALESCE(SUM(duration_seconds), 0)::INTEGER
  FROM sessions
  WHERE user_id = p_user_id
    AND created_at >= v_start_of_last_week
    AND created_at <= v_end_of_last_week;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SQL функция для получения длительности сессий пользователя за текущий месяц
CREATE OR REPLACE FUNCTION get_this_month_duration_seconds(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_start_of_month TIMESTAMP WITH TIME ZONE;
  v_end_of_month TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Начало текущего месяца (первый день 00:00:00)
  v_start_of_month := DATE_TRUNC('month', CURRENT_DATE AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';
  -- Конец текущего месяца (последний день 23:59:59)
  v_end_of_month := (DATE_TRUNC('month', CURRENT_DATE AT TIME ZONE 'UTC') + INTERVAL '1 month' - INTERVAL '1 second') AT TIME ZONE 'UTC';
  
  RETURN COALESCE(SUM(duration_seconds), 0)::INTEGER
  FROM sessions
  WHERE user_id = p_user_id
    AND created_at >= v_start_of_month
    AND created_at <= v_end_of_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SQL функция для получения длительности сессий пользователя за прошлый месяц
CREATE OR REPLACE FUNCTION get_last_month_duration_seconds(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_start_of_last_month TIMESTAMP WITH TIME ZONE;
  v_end_of_last_month TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Начало прошлого месяца (первый день 00:00:00)
  v_start_of_last_month := DATE_TRUNC('month', CURRENT_DATE AT TIME ZONE 'UTC' - INTERVAL '1 month') AT TIME ZONE 'UTC';
  -- Конец прошлого месяца (последний день 23:59:59)
  v_end_of_last_month := (DATE_TRUNC('month', CURRENT_DATE AT TIME ZONE 'UTC') - INTERVAL '1 second') AT TIME ZONE 'UTC';
  
  RETURN COALESCE(SUM(duration_seconds), 0)::INTEGER
  FROM sessions
  WHERE user_id = p_user_id
    AND created_at >= v_start_of_last_month
    AND created_at <= v_end_of_last_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Предоставляем права на выполнение функций для аутентифицированных пользователей
GRANT EXECUTE ON FUNCTION get_total_duration_seconds(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_today_duration_seconds(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_this_week_duration_seconds(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_last_week_duration_seconds(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_this_month_duration_seconds(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_last_month_duration_seconds(UUID) TO authenticated;

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

-- Создание таблицы playlists для хранения плейлистов пользователей
-- Выполните этот запрос в Supabase SQL Editor для создания таблицы
CREATE TABLE IF NOT EXISTS playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_ids UUID[] DEFAULT '{}' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS playlists_user_id_idx ON playlists(user_id);
CREATE INDEX IF NOT EXISTS playlists_created_at_idx ON playlists(created_at DESC);
CREATE INDEX IF NOT EXISTS playlists_exercise_ids_idx ON playlists USING GIN(exercise_ids);

-- Включение Row Level Security (RLS)
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

-- Политика безопасности: пользователи могут видеть только свои плейлисты
CREATE POLICY "Users can view their own playlists"
  ON playlists FOR SELECT
  USING (auth.uid() = user_id);

-- Политика безопасности: пользователи могут создавать свои плейлисты
CREATE POLICY "Users can create their own playlists"
  ON playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Политика безопасности: пользователи могут обновлять свои плейлисты
CREATE POLICY "Users can update their own playlists"
  ON playlists FOR UPDATE
  USING (auth.uid() = user_id);

-- Политика безопасности: пользователи могут удалять свои плейлисты
CREATE POLICY "Users can delete their own playlists"
  ON playlists FOR DELETE
  USING (auth.uid() = user_id);
