import { useModalStore } from '~/stores/modalStore';
import ModalDialog from './ModalDialog';
import FullWindowModalDialog from './FullWindowModalDialog';
import type { Item } from '~/types/exercise';

export default function ModalManager() {
  const modals = useModalStore((state) => state.modals);
  const closeModal = useModalStore((state) => state.closeModal);

  return (
    <>
      {modals.map((modal) => {
        const handleClose = (open?: boolean) => {
          if (open === false || open === undefined) {
            closeModal(modal.id);
          }
        };

        if (modal.type === 'regular') {
          return (
            <ModalDialog key={modal.id} open={true} setOpen={handleClose}>
              {modal.component}
            </ModalDialog>
          );
        }

        if (modal.type === 'fullwindow') {
          // Handle both item (direct) and exercise (convert to item)
          let item: Item | null = null;
          if (modal.data?.item) {
            item = modal.data.item as Item;
          } else if (modal.data?.exercise) {
            const exercise = modal.data.exercise as {
              id: string;
              name: string;
            };
            item = { id: exercise.id, name: exercise.name };
          }

          return (
            <FullWindowModalDialog
              key={modal.id}
              open={true}
              setOpen={handleClose}
              item={item}
            >
              {modal.component}
            </FullWindowModalDialog>
          );
        }

        return null;
      })}
    </>
  );
}
