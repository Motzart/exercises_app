import AlphabetList from '~/components/AlphabetList';
import CircleButton from '~/components/CircleButton';
import CreateExercise from '~/components/CreateExercise';
import RunExercise from '~/components/RunExercise';
import { useExercises } from '~/hooks/useExercises';
import { useModal } from '~/hooks/useModal';
import type { Exercise } from '~/types/exercise';

const ItemsPage = () => {
  const { openModal } = useModal();
  const { data: exercises, isLoading, isError, error } = useExercises();

  const handleOpenPracticeModal = (exercise: Exercise) => {
    openModal('fullwindow', <RunExercise exercise={exercise} />, { exercise });
  };

  const handleOpenCreateModal = () => {
    openModal('regular', <CreateExercise />);
  };

  return (
    <main>
      <div className="container mx-auto relative isolate overflow-hidden pt-16">
        {/* <input
          type="text"
          placeholder="Search ..."
          className="w-full my-10 p-2 border rounded-md border-white/20 outline-none focus:border-white/50"
        /> */}
        {exercises && exercises.length > 0 && (
          <AlphabetList
            exercises={exercises}
            onItemClick={handleOpenPracticeModal}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        )}
        <div className="fixed bottom-10 right-10">
          <CircleButton clickHandler={handleOpenCreateModal} />
        </div>
      </div>
    </main>
  );
};

export default ItemsPage;
