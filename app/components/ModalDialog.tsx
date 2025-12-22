import { Dialog, DialogContent } from './ui/dialog';

export default function ModalDialog({
  open,
  setOpen,
  children,
}: {
  open: boolean;
  setOpen: (open?: boolean) => void;
  children: React.ReactNode;
}) {
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">{children}</DialogContent>
    </Dialog>
  );
}
