import {
  EllipsisVerticalIcon,
  MusicalNoteIcon,
} from '@heroicons/react/20/solid';
import { Link } from 'react-router';
import type { Exercise } from '~/types/exercise';

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Card({
  exercise,
  handleClick,
}: {
  exercise: Exercise;
  handleClick: () => void;
}) {
  return (
    <div onClick={handleClick} className="cursor-pointer">
      <li
        key={exercise.name}
        className="col-span-1 flex rounded-md hover:bg-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] active:shadow-md active:translate-y-0.5"
      >
        <div
          className={
            'bg-green-600 flex w-16 shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white'
          }
        >
          <MusicalNoteIcon className="size-6 text-green-100" />
        </div>
        <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-white/10 bg-gray-800/50">
          <div className="flex-1 truncate px-4 py-2 text-sm">
            <div className="font-medium text-white hover:text-gray-200">
              {exercise.name}
            </div>
            <p className="text-gray-400">0 Members</p>
          </div>
          <div className="shrink-0 pr-2">
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-full text-gray-400 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-white"
            >
              <span className="sr-only">Open options</span>
              <EllipsisVerticalIcon aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
      </li>
    </div>
  );
}
