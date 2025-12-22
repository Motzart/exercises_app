import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '~/components/ui/item';
import { HeartIcon, CalendarIcon, ClockIcon } from '@heroicons/react/16/solid';
import {
  IconCalendarEvent,
  IconMusicCheck,
  IconMusicCode,
  IconMusicExclamation,
} from '@tabler/icons-react';
import type { Exercise, DaySessions } from '~/types/exercise';
import { formatDate, formatDuration } from '~/utils';
import { useSessionsByDay } from '~/hooks/useExercises';
import { useMemo } from 'react';

type ExerciseStatus = 'completed' | 'missing' | 'in-progress';

function getExerciseStatus(
  exercise: Exercise,
  todaySessions: DaySessions | null,
): ExerciseStatus {
  // Находим сессию для этого упражнения за сегодня
  const exerciseSession = todaySessions?.exercises.find(
    (ex) => ex.exerciseName === exercise.name,
  );

  const hasEstimatedTime = exercise.estimated_time > 0;
  const hasTodaySession = !!exerciseSession;

  // Если за сегодня есть сессия
  if (hasTodaySession) {
    // Если есть estimated_time и сессия >= estimated_time - completed (зеленый)
    if (
      hasEstimatedTime &&
      exerciseSession!.totalDurationSeconds >= exercise.estimated_time
    ) {
      return 'completed';
    }

    // Если есть сессия, но она < estimated_time - in-progress (оранжевый)
    if (
      hasEstimatedTime &&
      exerciseSession!.totalDurationSeconds < exercise.estimated_time
    ) {
      return 'in-progress';
    }
  }

  // Во всех остальных случаях - missing (красный)
  // (нет estimated_time ИЛИ за сегодня нет сессии)
  return 'missing';
}

function getStatusIcon(status: ExerciseStatus) {
  switch (status) {
    case 'completed':
      return <IconMusicCheck className="size-6 text-green-400" />;
    case 'missing':
      return <IconMusicExclamation className="size-6 text-red-400" />;
    case 'in-progress':
      return <IconMusicCode className="size-6 text-orange-400" />;
  }
}

function getStatusBackground(status: ExerciseStatus) {
  switch (status) {
    case 'completed':
      return 'bg-green-50/50 dark:bg-green-950/20';
    case 'missing':
      return 'bg-red-50/50 dark:bg-red-950/20';
    case 'in-progress':
      return 'bg-orange-50/50 dark:bg-orange-950/20';
  }
}

function getStatusHoverBorder(status: ExerciseStatus) {
  switch (status) {
    case 'completed':
      return 'hover:border-green-400 dark:hover:border-green-500';
    case 'missing':
      return 'hover:border-red-400 dark:hover:border-red-500';
    case 'in-progress':
      return 'hover:border-orange-400 dark:hover:border-orange-500';
  }
}

export function CustomItems({
  exercises,
  onItemClick,
}: {
  exercises: Exercise[];
  onItemClick: (exercises: Exercise) => void;
}) {
  const { data: sessionsByDay } = useSessionsByDay();

  const todaySessions = useMemo(() => {
    if (!sessionsByDay || sessionsByDay.length === 0) {
      return null;
    }

    const today = new Date().toISOString().split('T')[0];
    const found = sessionsByDay.find((day) => day.dateTime === today);

    // Debug: можно раскомментировать для отладки
    // console.log('Today:', today);
    // console.log('Sessions by day:', sessionsByDay.map(d => ({ date: d.date, dateTime: d.dateTime })));
    // console.log('Found today sessions:', found);

    return found || null;
  }, [sessionsByDay]);

  return (
    <div className="flex w-full flex-col gap-6">
      <ItemGroup className="gap-4">
        {exercises.map((ex) => {
          const status = getExerciseStatus(ex, todaySessions);
          const Icon = getStatusIcon(status);
          const backgroundClass = getStatusBackground(status);
          const hoverBorderClass = getStatusHoverBorder(status);

          // Находим сессию за сегодня для этого упражнения
          const todayExerciseSession = todaySessions?.exercises.find(
            (session) => session.exerciseName === ex.name,
          );

          // Сумма длительности всех сессий за сегодня, или 0 если сессий нет
          const todayDurationSeconds =
            todayExerciseSession?.totalDurationSeconds || 0;

          return (
            <Item
              key={ex.name}
              variant="outline"
              asChild
              role="listitem"
              className={`${backgroundClass} ${hoverBorderClass} [a]:hover:bg-transparent`}
            >
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onItemClick(ex);
                }}
              >
                <ItemMedia variant="image">{Icon}</ItemMedia>
                <ItemContent>
                  <ItemTitle className="line-clamp-1">
                    {ex.name} by {ex.author || '...'}
                  </ItemTitle>
                  <ItemDescription>
                    <span className="italic text-sm flex items-center gap-2">
                      <IconCalendarEvent className="size-4 text-gray-400" />
                      {ex.lastSession
                        ? formatDate(ex.lastSession.created_at)
                        : 'Нет сессий'}
                      <ClockIcon className="size-4 text-gray-400" />
                      {formatDuration(todayDurationSeconds)}
                      {ex.estimated_time > 0 && (
                        <>
                          <CalendarIcon className="size-4 text-gray-400" />
                          <span>{formatDuration(ex.estimated_time)}</span>
                        </>
                      )}
                    </span>
                  </ItemDescription>
                </ItemContent>
                <ItemContent className="flex-none text-center"></ItemContent>
              </a>
            </Item>
          );
        })}
      </ItemGroup>
    </div>
  );
}
