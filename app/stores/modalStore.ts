import { create } from 'zustand';
import type { ReactNode } from 'react';
import type { Exercise } from '~/types/exercise';

export type ModalType = 'regular' | 'fullwindow';

export interface ModalData {
  exercise?: Exercise | null;
  [key: string]: unknown;
}

export interface Modal {
  id: string;
  type: ModalType;
  data?: ModalData | null;
  component: ReactNode;
}

interface ModalStore {
  modals: Modal[];
  openModal: (
    type: ModalType,
    component: ReactNode,
    data?: ModalData | null,
  ) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  modals: [],
  openModal: (type, component, data = null) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set((state) => ({
      modals: [...state.modals, { id, type, component, data }],
    }));
    return id;
  },
  closeModal: (id) => {
    set((state) => ({
      modals: state.modals.filter((modal) => modal.id !== id),
    }));
  },
  closeAllModals: () => {
    set({ modals: [] });
  },
}));
