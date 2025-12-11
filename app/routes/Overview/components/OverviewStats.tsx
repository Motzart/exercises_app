import { ClockIcon } from '@heroicons/react/16/solid';
import { useTotalDuration } from '~/hooks/useTotalDuration';

const OverviewStats = () => {
  const { data: totalDuration, isLoading } = useTotalDuration();

  // Parse "02h:38m" format to "02,38" format
  const formatDurationForDisplay = (
    duration: string | undefined,
  ): { hours: string; minutes: string } => {
    if (!duration) return { hours: '00', minutes: '00' };

    const match = duration.match(/(\d+)h:(\d+)m/);
    if (match) {
      return {
        hours: match[1].padStart(2, '0'),
        minutes: match[2].padStart(2, '0'),
      };
    }
    return { hours: '00', minutes: '00' };
  };

  const { hours, minutes } = formatDurationForDisplay(totalDuration);

  return (
    <div className="flex flex-row gap-4 items-center justify-between">
      <div className="w-full items-center justify-center flex flex-col">
        <ClockIcon className="size-12 text-gray-300" />
        <div className="text-[72px] font-light text-white">
          <span className="text-[72px] font-light text-white">
            {isLoading ? '00' : hours}
          </span>
          <span className="text-[48px] font-light text-white">
            ,{isLoading ? '00' : minutes}
          </span>
        </div>
        <span className="text-[12px] font-bold text-white uppercase">
          Загальний час
        </span>
      </div>
      <div className="w-full">
        <ul className="grid grid-cols-2 gap-4">
          <li className="bg-gray-800/50 rounded-lg p-4">
            <span className="text-sm font-light text-white">Цього тижня</span>
            <span className="text-xl font-bold text-white ml-2">00h:00m</span>
          </li>
          <li className="bg-gray-800/50 rounded-lg p-4">
            <span className="text-sm font-light text-white">
              Минулого тижня
            </span>
            <span className="text-xl font-bold text-white ml-2">00h:00m</span>
          </li>
          <li className="bg-gray-800/50 rounded-lg p-4">
            <span className="text-sm font-light text-white">Цього місяця</span>
            <span className="text-xl font-bold text-white ml-2">00h:00m</span>
          </li>
          <li className="bg-gray-800/50 rounded-lg p-4">
            <span className="text-sm font-light text-white">
              Минулого місяця
            </span>
            <span className="text-xl font-bold text-white ml-2">00h:00m</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default OverviewStats;
