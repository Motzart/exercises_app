import {
  CalculatorIcon,
  CalendarIcon,
  ClockIcon,
  MusicalNoteIcon,
} from '@heroicons/react/16/solid';
import { Fragment } from 'react/jsx-runtime';
import { settings } from '~/constants';
import { useIsMobile } from '~/hooks/use-mobile';
import { useSessionsByDay } from '~/hooks/useExercises';
import { formatDuration } from '~/services/superbaseDb';

function getDurationColor(totalDurationSeconds: number): string {
  const minTime = settings.minTimeSessionByDay;

  if (totalDurationSeconds >= minTime) {
    return 'text-green-500';
  }

  if (totalDurationSeconds < minTime * 0.5) {
    return 'text-red-500';
  }

  if (totalDurationSeconds < minTime * 0.7) {
    return 'text-orange-500';
  }

  return 'text-white';
}

function getDurationBackgroundColor(totalDurationSeconds: number): string {
  const minTime = settings.minTimeSessionByDay;

  if (totalDurationSeconds >= minTime) {
    return 'bg-green-500/10';
  }

  if (totalDurationSeconds < minTime * 0.5) {
    return 'bg-red-500/10';
  }

  if (totalDurationSeconds < minTime * 0.7) {
    return 'bg-orange-500/10';
  }

  return '';
}

const HistoryPage = () => {
  const { data: days, isLoading, error } = useSessionsByDay();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="container mx-auto relative isolate overflow-hidden pt-4 sm:pt-16">
        <div className="mt-6 overflow-hidden border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
              <div className="text-white text-center py-8">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto relative isolate overflow-hidden pt-4 sm:pt-16">
        <div className="mt-6 overflow-hidden border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
              <div className="text-red-500 text-center py-8">
                Error loading sessions:{' '}
                {error instanceof Error ? error.message : 'Unknown error'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!days || days.length === 0) {
    return (
      <div className="container mx-auto relative isolate overflow-hidden pt-4 sm:pt-16">
        <div className="mt-6 overflow-hidden border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
              <div className="text-white text-center py-8">
                No sessions found
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="container mx-auto relative isolate overflow-hidden pt-4">
        <div className="overflow-hidden border-t border-white/5">
          <div className="mx-auto px-4">
            <div className="flex flex-col gap-4">
              {days.map((day) => (
                <div
                  key={day.dateTime}
                  className={`rounded-lg border border-white/10 ${getDurationBackgroundColor(day.totalDurationSeconds)}`}
                >
                  <div className="p-4 border-b border-white/10">
                    <div className="flex flex-col gap-3">
                      <time
                        dateTime={day.dateTime}
                        className="flex items-center gap-2 text-sm font-semibold text-white"
                      >
                        <CalendarIcon className="size-5 text-white" />
                        {day.date}
                      </time>
                      <div className="flex items-center gap-2 text-sm text-white">
                        <span>Загальний час:</span>
                        <span
                          className={getDurationColor(day.totalDurationSeconds)}
                        >
                          {formatDuration(day.totalDurationSeconds)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-white/10">
                    {day.exercises.map((exercise, index) => (
                      <div
                        key={`${day.dateTime}-${exercise.exerciseName}-${index}`}
                        className="p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <MusicalNoteIcon
                              aria-hidden="true"
                              className="h-5 w-5 flex-none text-gray-500 shrink-0"
                            />
                            <div className="flex-auto min-w-0">
                              <div className="text-sm font-medium text-white truncate">
                                {exercise.exerciseName}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <ClockIcon className="size-4 text-gray-500" />
                            <span className="text-sm text-white italic whitespace-nowrap">
                              {formatDuration(exercise.totalDurationSeconds)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto relative isolate overflow-hidden">
      <div className="overflow-hidden border-t border-white/5">
        <div className="mx-auto">
          <div className="mx-auto">
            <table className="w-full text-left">
              <tbody>
                {days.map((day) => (
                  <Fragment key={day.dateTime}>
                    <tr className="text-sm/6 text-white">
                      <th
                        scope="colgroup"
                        colSpan={2}
                        className={`relative isolate py-2 font-semibold px-4 sm:px-8 ${getDurationBackgroundColor(day.totalDurationSeconds)}`}
                      >
                        <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                          <time
                            dateTime={day.dateTime}
                            className="flex items-center gap-2"
                          >
                            <CalendarIcon className="size-5 text-white" />
                            {day.date}
                          </time>
                          <div className="flex items-center gap-2">
                            <span>Загальний час: </span>
                            <span
                              className={getDurationColor(
                                day.totalDurationSeconds,
                              )}
                            >
                              {formatDuration(day.totalDurationSeconds)}
                            </span>
                          </div>
                        </div>
                      </th>
                    </tr>
                    {day.exercises.map((exercise, index) => (
                      <tr
                        key={`${day.dateTime}-${exercise.exerciseName}-${index}`}
                      >
                        <td className="relative py-5 pr-6">
                          <div className="flex gap-x-6">
                            <MusicalNoteIcon
                              aria-hidden="true"
                              className="hidden h-6 w-5 flex-none text-gray-500 sm:block"
                            />
                            <div className="flex-auto">
                              <div className="text-sm/6 font-medium text-white">
                                {exercise.exerciseName}
                              </div>
                            </div>
                          </div>
                          <div className="absolute right-full bottom-0 h-px w-screen bg-white/5" />
                          <div className="absolute bottom-0 left-0 h-px w-screen bg-white/5" />
                        </td>
                        <td className="py-5 text-right">
                          <div className="flex justify-end">
                            <ClockIcon className="size-5 text-gray-500" />
                            <span className="text-sm/6 text-white pl-3 italic">
                              {formatDuration(exercise.totalDurationSeconds)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
