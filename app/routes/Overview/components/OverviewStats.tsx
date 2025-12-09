import { ClockIcon } from '@heroicons/react/16/solid';

const OverviewStats = () => {
  return (
    <div className="flex flex-row gap-4 items-center justify-between">
      <div className="w-full">
        <ClockIcon className="size-6 text-green-300" />
        <span className="text-sm font-bold text-white">Total Hours</span>
        <span className="text-sm font-bold text-white">00h:00m</span>
      </div>
      <div className="w-full">
        <ul>
          <li>
            <span className="text-sm font-bold text-white">This week</span>
            <span className="text-sm font-bold text-white">00h:00m</span>
          </li>
          <li>
            <span className="text-sm font-bold text-white">This week</span>
            <span className="text-sm font-bold text-white">00h:00m</span>
          </li>
          <li>
            <span className="text-sm font-bold text-white">This week</span>
            <span className="text-sm font-bold text-white">00h:00m</span>
          </li>
          <li>
            <span className="text-sm font-bold text-white">This week</span>
            <span className="text-sm font-bold text-white">00h:00m</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default OverviewStats;
