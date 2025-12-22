import AlphabetList from '~/components/AlphabetList';
import CircleButton from '~/components/CircleButton';
import CreateExercise from '~/components/CreateExercise';
import { DataTable } from '~/components/data-table';
import EditExercise from '~/components/EditExercise';
import { ExercisesList } from '~/components/ExercisesList';
import RunExercise from '~/components/RunExercise';
import { useDeleteExercise, useExercises } from '~/hooks/useExercises';
import { useModal } from '~/hooks/useModal';
import type { Exercise } from '~/types/exercise';
import { ExerciseTable } from '~/components/ExerciseTable';

const ItemsPage = () => {
  const { openModal } = useModal();
  const { data: exercises, isLoading, isError, error } = useExercises();
  const deleteExerciseMutation = useDeleteExercise();

  const handleOpenPracticeModal = (exercise: Exercise) => {
    openModal('fullwindow', <RunExercise exercise={exercise} />, { exercise });
  };

  const handleOpenCreateModal = () => {
    openModal('regular', <CreateExercise />);
  };

  const handleEdit = (exercise: Exercise) => {
    openModal('regular', <EditExercise exercise={exercise} />);
  };

  const handleDelete = async (exercise: Exercise) => {
    if (
      window.confirm(
        `Ви впевнені, що хочете видалити вправу "${exercise.name}"?`,
      )
    ) {
      try {
        await deleteExerciseMutation.mutateAsync(exercise.id);
      } catch (error) {
        console.error('Error deleting exercise:', error);
        alert('Помилка при видаленні вправи');
      }
    }
  };

  return (
    <>
      {exercises && exercises.length > 0 && (
        <ExerciseTable
          data={exercises}
          onAdd={handleOpenCreateModal}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPractice={handleOpenPracticeModal}
        />
      )}
    </>
  );
};

export default ItemsPage;
