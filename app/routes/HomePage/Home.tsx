import { SectionCards } from '~/components/section-cards';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { useExercises, usePlaylists, useSessionsByDay } from '~/hooks/useExercises';
import type { Exercise, DaySessions } from '~/types/exercise';
import RunExercise from '~/components/RunExercise';
import { useModal } from '~/hooks/useModal';
import type { PlaylistWithCount } from '~/services/superbaseDb';
import { Link } from 'react-router';
import { formatDate, formatDuration } from '~/utils';
import { useMemo } from 'react';
import {
  IconMusicCheck,
  IconMusicCode,
  IconMusicExclamation,
  IconCalendarEvent,
  IconPlus,
} from '@tabler/icons-react';
import { ClockIcon, CalendarIcon } from '@heroicons/react/16/solid';
import CreateExercise from '~/components/CreateExercise';
import CreatePlaylist from '~/components/CreatePlaylist';

type ExerciseStatus = 'completed' | 'missing' | 'in-progress';

function getExerciseStatus(
  exercise: Exercise,
  todaySessions: DaySessions | null,
): ExerciseStatus {
  const exerciseSession = todaySessions?.exercises.find(
    (ex) => ex.exerciseName === exercise.name,
  );

  const hasEstimatedTime = exercise.estimated_time > 0;
  const hasTodaySession = !!exerciseSession;

  if (hasTodaySession) {
    if (
      hasEstimatedTime &&
      exerciseSession!.totalDurationSeconds >= exercise.estimated_time
    ) {
      return 'completed';
    }

    if (
      hasEstimatedTime &&
      exerciseSession!.totalDurationSeconds < exercise.estimated_time
    ) {
      return 'in-progress';
    }
  }

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
      return 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900';
    case 'missing':
      return 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900';
    case 'in-progress':
      return 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900';
  }
}

function FavoriteExerciseCard({
  exercise,
  todaySessions,
  onItemClick,
}: {
  exercise: Exercise;
  todaySessions: DaySessions | null;
  onItemClick: (exercise: Exercise) => void;
}) {
  const status = getExerciseStatus(exercise, todaySessions);
  const Icon = getStatusIcon(status);
  const backgroundClass = getStatusBackground(status);

  const todayExerciseSession = todaySessions?.exercises.find(
    (session) => session.exerciseName === exercise.name,
  );

  const todayDurationSeconds =
    todayExerciseSession?.totalDurationSeconds || 0;

  return (
    <Card
      className={`${backgroundClass} hover:shadow-md transition-all cursor-pointer h-full`}
      onClick={() => onItemClick(exercise)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-1">
              {exercise.name}
            </CardTitle>
            {exercise.author && (
              <CardDescription className="text-sm mt-1 line-clamp-1">
                by {exercise.author}
              </CardDescription>
            )}
          </div>
          <div className="shrink-0">{Icon}</div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <IconCalendarEvent className="size-4" />
            <span>
              {exercise.lastSession
                ? formatDate(exercise.lastSession.created_at)
                : 'Нет сессий'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="size-4" />
            <span>{formatDuration(todayDurationSeconds)}</span>
            {exercise.estimated_time > 0 && (
              <>
                <CalendarIcon className="size-4 ml-1" />
                <span>{formatDuration(exercise.estimated_time)}</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PlaylistCard({ playlist }: { playlist: PlaylistWithCount }) {
  return (
    <Card className="hover:shadow-md transition-all h-full bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
      <Link to={`/play-lists/${playlist.id}`} className="block h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base line-clamp-1">{playlist.name}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <IconCalendarEvent className="size-4" />
              <span>{formatDate(playlist.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>
                {playlist.exercise_count}{' '}
                {playlist.exercise_count === 1 ? 'вправа' : 'вправ'}
              </span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

const Home = () => {
  const { openModal } = useModal();

  const {
    data: exercises = [],
    isLoading,
  } = useExercises({ favorite: true });

  const { data: playlists = [], isLoading: isLoadingPlaylists } =
    usePlaylists();

  const { data: sessionsByDay } = useSessionsByDay();

  const todaySessions = useMemo(() => {
    if (!sessionsByDay || sessionsByDay.length === 0) {
      return null;
    }

    const today = new Date().toISOString().split('T')[0];
    const found = sessionsByDay.find((day) => day.dateTime === today);

    return found || null;
  }, [sessionsByDay]);

  const handleOpenPracticeModal = (exercise: Exercise) => {
    openModal('fullwindow', <RunExercise exercise={exercise} />, { exercise });
  };

  const handleOpenCreateExerciseModal = () => {
    openModal('regular', <CreateExercise />);
  };

  const handleOpenCreatePlaylistModal = () => {
    openModal('fullwindow', <CreatePlaylist />);
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <SectionCards />

      <div className="flex flex-col gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Вибрані вправи</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenCreateExerciseModal}
              className="gap-2"
            >
              <IconPlus className="size-4" />
              Додати вправу
            </Button>
          </div>
          {isLoading ? (
            <div className="text-muted-foreground text-sm">Завантаження...</div>
          ) : exercises.length === 0 ? (
            <div className="text-muted-foreground text-sm italic">
              Немає вибраних вправ
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {exercises.map((exercise) => (
                <FavoriteExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  todaySessions={todaySessions}
                  onItemClick={handleOpenPracticeModal}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Списки вправ</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenCreatePlaylistModal}
              className="gap-2"
            >
              <IconPlus className="size-4" />
              Створити список
            </Button>
          </div>
          {isLoadingPlaylists ? (
            <div className="text-muted-foreground text-sm">Завантаження...</div>
          ) : playlists.length === 0 ? (
            <div className="text-muted-foreground text-sm italic">
              Немає списків
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
