import { PlusIcon } from '@heroicons/react/16/solid';

const CircleButton = ({ clickHandler }: { clickHandler: () => void }) => {
  return (
    <button
      type="button"
      onClick={clickHandler}
      className="rounded-full bg-indigo-500 p-2 text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer"
    >
      <PlusIcon aria-hidden="true" className="size-12" />
    </button>
  );
};

export default CircleButton;
