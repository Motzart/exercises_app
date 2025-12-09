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

