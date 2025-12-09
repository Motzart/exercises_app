import {
  CalendarIcon,
  ClockIcon,
  DocumentIcon,
} from '@heroicons/react/16/solid';
import {
  useTotalDuration,
  useTodayDuration,
  useExercisesCount,
} from '~/hooks/useTotalDuration';

const stats = [
  {
    label: 'Усього часу',
    value: '00h:00m',
    icon: <ClockIcon className="size-6 text-green-300" />,
  },
  {
    label: 'Сьогодні',
    value: '00h:00m',
    icon: <ClockIcon className="size-6 text-gray-300" />,
  },
  {
    label: 'Day Streak',
    value: '0',
    icon: <CalendarIcon className="size-6 text-gray-300" />,
  },
  {
    label: 'Кіл-ть вправ',
    value: '0',
    icon: <DocumentIcon className="size-6 text-gray-300" />,
  },
];

const HomeStatsBlock = () => {
  const { data: totalDuration, isLoading: isLoadingTotal } = useTotalDuration();
  const { data: todayDuration, isLoading: isLoadingToday } = useTodayDuration();
  const { data: exercisesCount, isLoading: isLoadingCount } =
    useExercisesCount();

  const statsWithData = stats.map((stat, index) => {
    if (index === 0) {
      return {
        ...stat,
        value: isLoadingTotal ? '00h:00m' : totalDuration || '00h:00m',
      };
    }
    if (index === 1) {
      return {
        ...stat,
        value: isLoadingToday ? '00h:00m' : todayDuration || '00h:00m',
      };
    }
    if (index === 3) {
      return {
        ...stat,
        value: isLoadingCount ? '0' : String(exercisesCount || 0),
      };
    }
    return stat;
  });

  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-12 sm:mt-20 sm:grid-cols-2 sm:gap-y-16 lg:mt-8 lg:grid-cols-4">
      {statsWithData.map((stat, statIdx) => (
        <div
          key={statIdx}
          className="flex items-center flex-col-reverse gap-y-3 border-b-2 border-indigo-500 pl-6"
        >
          <dt className="text-base/7 text-gray-300">{stat.label}</dt>
          <dd className="flex flex-row items-center gap-x-2 text-3xl font-semibold tracking-tight text-white">
            {stat.icon} {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
};

export default HomeStatsBlock;
