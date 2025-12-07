import type { Exercise } from '~/types/exercise';
import OwnTimer from './OwnTimer';
import { useModal } from '~/hooks/useModal';

const RunExercise = ({ exercise }: { exercise: Exercise | null }) => {
  const { closeAllModals } = useModal();

  return (
    <div className="container mx-auto relative isolate overflow-hidden pt-16">
      <div className="my-10">
        <OwnTimer onClose={closeAllModals} exercise={exercise} />
      </div>
    </div>
  );
};

export default RunExercise;
