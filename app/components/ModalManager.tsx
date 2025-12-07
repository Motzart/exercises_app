import { useModalStore } from '~/stores/modalStore';
import ModalDialog from './ModalDialog';
import FullWindowModalDialog from './FullWindowModalDialog';

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
          return (
            <FullWindowModalDialog
              key={modal.id}
              open={true}
              setOpen={handleClose}
              item={modal.data?.item || null}
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
