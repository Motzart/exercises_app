import { PlusIcon } from '@heroicons/react/20/solid';

export default function Devider({ buttonText }: { buttonText?: string }) {
  return (
    <div className="relative flex items-center justify-between">
      <div className="flex w-full items-center">
        <div
          aria-hidden="true"
          className="w-full border-t border-white/15 shadow-lg transition-all duration-200"
        />
        {buttonText && (
          <button
            type="button"
            className="inline-flex items-center gap-x-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-white inset-ring inset-ring-white/5 hover:bg-white/20 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] active:shadow-md active:translate-y-0.5"
          >
            <PlusIcon
              aria-hidden="true"
              className="-mr-0.5 -ml-1 size-5 text-gray-400"
            />
            <span>{buttonText}</span>
          </button>
        )}
      </div>
    </div>
  );
}
