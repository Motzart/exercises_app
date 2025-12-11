import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { Item } from '~/types/exercise';

export default function FullWindowModalDialog({
  open,
  setOpen,
  item,
  children,
}: {
  open: boolean;
  setOpen: any;
  item: Item | null;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onClose={setOpen} className="relative z-2000">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-stretch justify-center text-center">
          <DialogPanel
            transition
            className="relative flex w-screen min-h-screen transform flex-col bg-gray-700 p-6 text-left text-white shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:p-10"
          >
            <DialogTitle
              as="h3"
              className="w-full text-center text-2xl font-medium text-white"
            >
              {item?.name}
            </DialogTitle>
            <div className="absolute left-4 top-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md bg-white/10 p-2 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
              >
                <span className="sr-only">Close</span>
                <ArrowLeftIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            {children}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
