import { useMemo, useState, useRef, useEffect } from 'react';
import { Calendar } from './ui/calendar';
import { useSessionsByDateRange } from '~/hooks/useTotalDuration';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import type { DayButton } from 'react-day-picker';
import { Button } from './ui/button';
import { cn } from '~/lib/utils';
import { getDefaultClassNames } from 'react-day-picker';

const CalendarView = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  // Получаем начало и конец текущего месяца
  const monthStart = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [month]);

  const monthEnd = useMemo(() => {
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [month]);

  // Получаем данные о сессиях для текущего месяца
  const { data: sessionsData = [] } = useSessionsByDateRange(
    monthStart,
    monthEnd,
  );

  // Создаем Map для быстрого доступа к данным по дате
  const sessionsMap = useMemo(() => {
    const map = new Map<string, number>();
    sessionsData.forEach((session) => {
      map.set(session.date, session.durationSeconds);
    });
    return map;
  }, [sessionsData]);

  // Функция для форматирования времени
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours === 0) {
      return `${minutes} хв.`;
    }
    if (minutes === 0) {
      return `${hours} год.`;
    }
    return `${hours} год. ${minutes} хв.`;
  };

  // Функция для определения уровня занятий
  const getSessionLevel = (durationSeconds: number): string | null => {
    if (durationSeconds === 0) return null;

    const hours = durationSeconds / 3600;

    if (hours < 1) {
      return 'low'; // Голубоватый (< 1 часа)
    } else if (hours >= 1 && hours <= 2) {
      return 'medium-blue'; // Оранжевый (от 1 до 2 часов включительно)
    } else if (hours > 3) {
      return 'high'; // Красный (> 3 часов)
    }

    // От 2 до 3 часов - используем средний уровень
    return 'medium';
  };

  // Модификаторы для дней с занятиями
  const modifiers = useMemo(() => {
    const mods: Record<string, Date[]> = {};

    sessionsData.forEach((session) => {
      // Парсим дату в формате YYYY-MM-DD и создаем Date в локальном времени
      // чтобы избежать проблем с часовыми поясами
      const [year, month, day] = session.date.split('-').map(Number);
      const sessionDate = new Date(year, month - 1, day);
      sessionDate.setHours(0, 0, 0, 0);

      const level = getSessionLevel(session.durationSeconds);

      if (level) {
        const key = `session-${level}`;
        if (!mods[key]) {
          mods[key] = [];
        }
        mods[key].push(sessionDate);
      }
    });

    return mods;
  }, [sessionsData]);

  // Классы для модификаторов
  // Используем цвета, похожие на карту активности GitHub для лучшей видимости на темном фоне
  const modifiersClassNames = useMemo(() => {
    return {
      'session-low': 'bg-cyan-100/70 dark:bg-[#0e4429]/60 rounded-md',
      'session-medium-blue': 'bg-orange-300/75 dark:bg-orange-600/70 rounded-md',
      'session-medium': 'bg-green-200/75 dark:bg-[#1a7f37]/70 rounded-md',
      'session-high': 'bg-red-400/85 dark:bg-red-600/80 rounded-md',
    };
  }, []);

  // Кастомный DayButton с tooltip
  const CustomDayButton = useMemo(() => {
    return function CustomDayButton({
      className,
      day,
      modifiers,
      ...props
    }: React.ComponentProps<typeof DayButton>) {
      const defaultClassNames = getDefaultClassNames();
      const ref = useRef<HTMLButtonElement>(null);

      useEffect(() => {
        if (modifiers.focused) ref.current?.focus();
      }, [modifiers.focused]);

      // Формируем ключ даты для поиска в Map
      const dateKey = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`;
      const durationSeconds = sessionsMap.get(dateKey) || 0;
      const hasSessions = durationSeconds > 0;

      const button = (
        <Button
          ref={ref}
          variant="ghost"
          size="icon"
          data-day={day.date.toLocaleDateString()}
          data-selected-single={
            modifiers.selected &&
            !modifiers.range_start &&
            !modifiers.range_end &&
            !modifiers.range_middle
          }
          data-range-start={modifiers.range_start}
          data-range-end={modifiers.range_end}
          data-range-middle={modifiers.range_middle}
          className={cn(
            'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70',
            defaultClassNames.day,
            className,
          )}
          {...props}
        />
      );

      if (!hasSessions) {
        return button;
      }

      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>{formatDuration(durationSeconds)}</TooltipContent>
        </Tooltip>
      );
    };
  }, [sessionsMap]);

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      month={month}
      onMonthChange={setMonth}
      modifiers={modifiers}
      modifiersClassNames={modifiersClassNames}
      components={{
        DayButton: CustomDayButton,
      }}
      className="rounded-lg border "
      buttonVariant="ghost"
    />
  );
};

export default CalendarView;
