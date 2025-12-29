import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { Item } from '~/types/exercise';
import { Button } from './ui/button';
import { cn } from '~/lib/utils';
import { useIsMobile } from '~/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-2000">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-stretch justify-center text-center">
          <DialogPanel
            transition
            className={cn(
              'relative flex w-screen min-h-screen transform flex-col',
              'bg-background text-foreground',
              'p-3 sm:p-4 md:p-6 lg:p-10 text-left shadow-xl',
              'transition-all',
              'data-closed:translate-y-4 data-closed:opacity-0',
              'data-enter:duration-300 data-enter:ease-out',
              'data-leave:duration-200 data-leave:ease-in',
            )}
          >
            <DialogTitle
              as="h3"
              className={cn(
                'w-full text-center font-medium text-foreground',
                'text-lg sm:text-xl md:text-2xl',
                'px-8 sm:px-12',
                isMobile && 'pt-2',
              )}
            >
              {item?.name}
            </DialogTitle>
            <div className={cn(
              'absolute top-2 sm:top-3 md:top-4',
              'left-2 sm:left-3 md:left-4',
            )}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-md',
                  'h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10',
                )}
              >
                <span className="sr-only">Close</span>
                <ArrowLeftIcon aria-hidden="true" className="size-4 sm:size-5 md:size-6" />
              </Button>
            </div>
            <div className={cn(
              'flex-1 flex flex-col',
              isMobile && 'min-h-0',
            )}>
              {children}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
