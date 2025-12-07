import { useModalStore } from '~/stores/modalStore';
import type { ModalType, ModalData } from '~/stores/modalStore';
import type { ReactNode } from 'react';

export function useModal() {
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const closeAllModals = useModalStore((state) => state.closeAllModals);

  return {
    openModal: (
      type: ModalType,
      component: ReactNode,
      data?: ModalData | null,
    ) => openModal(type, component, data),
    closeModal,
    closeAllModals,
  };
}
