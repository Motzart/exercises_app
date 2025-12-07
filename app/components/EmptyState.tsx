import { PlusIcon } from '@heroicons/react/20/solid';

export default function EmptyState({
  title,
  description,
  buttonText,
}: {
  title: string;
  description: string;
  buttonText: string;
}) {
  return (
    <div className="text-center">
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="mx-auto size-12 text-gray-500"
      >
        <path
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h3 className="mt-2 text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-400">{description}</p>
    </div>
  );
}
