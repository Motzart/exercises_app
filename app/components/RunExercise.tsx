import type { Exercise } from '~/types/exercise';
import OwnTimer from './OwnTimer';
import { useModal } from '~/hooks/useModal';

function RunExercise({ exercise }: { exercise: Exercise | null }) {
  const { closeAllModals } = useModal();

  return (
    <div className="flex flex-col h-full w-full">
      <OwnTimer onClose={closeAllModals} exercise={exercise} />
    </div>
  );
}

export default RunExercise;
