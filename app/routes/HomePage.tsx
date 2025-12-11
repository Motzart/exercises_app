import {
  CalendarIcon,
  ClockIcon,
  DocumentIcon,
  FolderIcon,
  FolderOpenIcon,
  HeartIcon,
  ListBulletIcon,
  PlusIcon,
} from '@heroicons/react/16/solid';
import type { Route } from './+types/home';
import Card from '~/components/Card';
import Devider from '~/components/Devider';
import { Link } from 'react-router';
import FavoritesList from '~/components/FavoritesList';
import HomeStatsBlock from '~/components/HomeStatsBlock';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Practice Journal' }, { name: 'description' }];
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
    name: 'Warming Up',
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
          <HomeStatsBlock />
        </div>
        <div className="container mx-auto relative isolate overflow-hidden">
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {SecondaryNavigation.map((item) => (
              <Link
                to={item.href}
                key={item.name}
                className="cursor-pointer hover:bg-gray-800/50 overflow-hidden rounded-lg bg-gray-800/75 px-4 py-5 shadow-sm inset-ring inset-ring-white/10 sm:p-6"
              >
                <dt className="text-center truncate text-sm font-medium text-gray-300 uppercase flex items-center justify-center gap-x-2">
                  <ListBulletIcon className="size-6 text-green-300" />
                  {item.name}
                </dt>
              </Link>
            ))}
          </dl>
        </div>
        <div className="container mx-auto my-10 bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-x-2">
            <h2 className="text-lg font-light">Недавні списки:</h2>
          </div>

          <ul
            role="list"
            className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-8"
          >
            {itemsPlayList.map((exercise) => (
              <div className="relative flex flex-col items-center gap-x-2 cursor-pointer hover:bg-gray-800/50 rounded-lg p-4">
                <DocumentIcon className="size-18 text-blue-200" />
                <p className="absolute top-10 right-16 text-gray-800 text-lg">2</p>
                <p className="text-gray-500">{exercise.name}</p>
              </div>
            ))}
            <div className="relative flex flex-col items-center gap-x-2 cursor-pointer hover:bg-gray-800/50 rounded-lg p-4">
                <DocumentIcon className="size-18 text-gray-500" />
                <p className="absolute top-9 right-15 text-gray-800 text-2xl">+</p>
                <p className="text-gray-500">Додати</p>
              </div>
          </ul>
        </div>

        <div className="container mx-auto my-10 bg-gray-800/50 rounded-lg p-4">
          <FavoritesList />
        </div>
      </main>
    </>
  );
}
