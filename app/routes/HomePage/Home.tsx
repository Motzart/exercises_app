import { ChartAreaInteractive } from '~/components/chart-area-interactive';
import { DataTable } from '~/components/data-table';
import { SectionCards } from '~/components/section-cards';
import data from '../../dashboard/data.json';
import GraphStats from '../Overview/components/GraphStats';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Badge } from 'lucide-react';
import { IconTrendingUp } from '@tabler/icons-react';
import { ExercisesList } from '~/components/ExercisesList';
import { useExercises, usePlaylists } from '~/hooks/useExercises';
import { CustomItems } from '~/components/CustomItem';
import type { Exercise } from '~/types/exercise';
import RunExercise from '~/components/RunExercise';
import { useModal } from '~/hooks/useModal';
import { PlayListItems } from '~/components/PlayListItem';

const Home = () => {
  const { openModal } = useModal();

  const {
    data: exercises = [],
    isLoading,
    isFetching,
  } = useExercises({ favorite: true });

  const { data: playlists = [], isLoading: isLoadingPlaylists } =
    usePlaylists();

  const handleOpenPracticeModal = (exercise: Exercise) => {
    openModal('fullwindow', <RunExercise exercise={exercise} />, { exercise });
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            {/* <ChartAreaInteractive /> */}
            {/* <GraphStats /> */}
            <div className=" flex flex-row gap-4">
              <div className="w-full">
                <h1 className="pb-4">Вибрані вправи:</h1>
                <CustomItems
                  exercises={exercises || []}
                  onItemClick={handleOpenPracticeModal}
                />
              </div>
              <div className="w-full">
                <h1 className="pb-4">Списки вправ:</h1>
                <PlayListItems
                  playlists={playlists || []}
                  onItemClick={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
