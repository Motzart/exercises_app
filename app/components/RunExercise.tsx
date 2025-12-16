import type { Exercise } from '~/types/exercise';
import OwnTimer from './OwnTimer';
import { useModal } from '~/hooks/useModal';
import Devider from './Devider';

const RunExercise = ({ exercise }: { exercise: Exercise | null }) => {
  const { closeAllModals } = useModal();

  return (
    <div className="container mx-auto relative isolate overflow-hidden pt-8">
      <div className="flex flex-col items-center justify-center">
        <div
          aria-hidden="true"
          className="w-[300px] my-5 border-t border-gray-600 shadow-lg transition-all duration-200"
        />
        <OwnTimer onClose={closeAllModals} exercise={exercise} />
      </div>
    </div>
  );
};

export default RunExercise;
