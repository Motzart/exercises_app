import {
  CalendarIcon,
  ClockIcon,
  DocumentIcon,
  HeartIcon,
  PlusIcon,
} from '@heroicons/react/16/solid';
import type { Route } from './+types/home';
import Card from '~/components/Card';
import Devider from '~/components/Devider';
import { Link } from 'react-router';
import FavoritesList from '~/components/FavoritesList';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Smart Diary' },
    { name: 'description', content: 'Welcome to Smart Diary!' },
  ];
}

const stats = [
  {
    label: 'Total Hours',
    value: '03h 21m',
    icon: <ClockIcon className="size-6 text-green-300" />,
  },
  {
    label: 'Today',
    value: '00h 20m',
    icon: <ClockIcon className="size-6 text-gray-300" />,
  },
  {
    label: 'Day Streak',
    value: '3',
    icon: <CalendarIcon className="size-6 text-gray-300" />,
  },
  {
    label: 'Items',
    value: '16',
    icon: <DocumentIcon className="size-6 text-gray-300" />,
  },
];

const SecondaryNavigation = [
  { name: 'Вправи', stat: '58.16%', href: '/exercises' },
  { name: 'Списки вправ', stat: '71,897', href: '/play-lists' },
];
const itemsPlayList = [
  {
    name: 'Play List 1',
    initials: 'GA',
    href: '#',
    members: 16,
    bgColor: 'bg-pink-700',
  },
  {
    name: 'Play List 2',
    initials: 'CD',
    href: '#',
    members: 12,
    bgColor: 'bg-purple-700',
  },
];

export default function HomePage() {
  return (
    <>
      <main>
        <div className="container mx-auto relative isolate overflow-hidden pt-16">
          {/* Stats */}
          <dl className="grid grid-cols-1 gap-x-8 gap-y-12 sm:mt-20 sm:grid-cols-2 sm:gap-y-16 lg:mt-8 lg:grid-cols-4">
            {stats.map((stat, statIdx) => (
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
        </div>
        <div className="container mx-auto relative isolate overflow-hidden">
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {SecondaryNavigation.map((item) => (
              <Link
                to={item.href}
                key={item.name}
                className="cursor-pointer hover:bg-gray-800/50 overflow-hidden rounded-lg bg-gray-800/75 px-4 py-5 shadow-sm inset-ring inset-ring-white/10 sm:p-6"
              >
                <dt className="text-center truncate text-sm font-medium text-gray-300 uppercase">
                  {item.name}
                </dt>
              </Link>
            ))}
          </dl>
        </div>
        <div className="container mx-auto my-10 bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-x-2">
            <h2 className="text-lg font-light uppercase">Недавні списки:</h2>
          </div>

          <ul
            role="list"
            className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
          >
            {itemsPlayList.map((exercise) => (
              <Card
                handleClick={() => {}}
                key={exercise.name}
                exercise={exercise}
              />
            ))}
          </ul>
          <Devider buttonText="Створити список" />
        </div>

        <div className="container mx-auto my-10 bg-gray-800/50 rounded-lg p-4">
          <FavoritesList />
        </div>
      </main>
    </>
  );
}
