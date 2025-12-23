import { useParams } from 'react-router';
import { CustomItems } from '~/components/CustomItem';
import RunExercise from '~/components/RunExercise';
import { usePlaylist, useExercisesByIds } from '~/hooks/useExercises';
import { useModal } from '~/hooks/useModal';
import type { Exercise } from '~/types/exercise';

export default function PlaylistPage() {
  const { openModal } = useModal();
  const { id } = useParams();
  const { data: playlist, isLoading, isError, error } = usePlaylist(id || '');
  const { data: exercises = [], isLoading: isLoadingExercises } =
    useExercisesByIds(playlist?.exercise_ids || []);

  const handleOpenPracticeModal = (exercise: Exercise) => {
    openModal('fullwindow', <RunExercise exercise={exercise} />, { exercise });
  };

  if (isLoading || isLoadingExercises) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-foreground">Завантаження...</div>
      </div>
    );
  }

  if (isError || !playlist) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-destructive">
          {error instanceof Error ? error.message : 'Плейлист не знайдено'}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6">
      <h1 className="pb-4">{playlist.name}</h1>
      <CustomItems
        exercises={exercises}
        onItemClick={handleOpenPracticeModal}
      />
    </div>
  );
}
