import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ModalType = 
  | 'login' 
  | 'signup' 
  | 'forgotPassword'
  | 'settings'
  | 'departmentInfo'
  | 'membershipDetails'
  | 'eventDetails'
  | 'confirmAction';

interface ModalData {
  [key: string]: any;
}

interface ModalState {
  activeModals: {
    type: ModalType;
    data?: ModalData;
  }[];
  
  // Actions
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: (type: ModalType) => void;
  closeAllModals: () => void;
  updateModalData: (type: ModalType, data: ModalData) => void;
  
  // Selectors (for convenience)
  isModalOpen: (type: ModalType) => boolean;
  getModalData: (type: ModalType) => ModalData | undefined;
}

export const useModalStore = create<ModalState>()(
  immer((set, get) => ({
    activeModals: [],
    
    openModal: (type, data) => {
      // If the modal is already open, update its data
      if (get().isModalOpen(type)) {
        get().updateModalData(type, data || {});
        return;
      }
      
      // Otherwise, add it to the active modals
      set(state => {
        state.activeModals.push({ type, data });
      });
    },
    
    closeModal: (type) => {
      set(state => {
        state.activeModals = state.activeModals.filter(modal => modal.type !== type);
      });
    },
    
    closeAllModals: () => {
      set(state => {
        state.activeModals = [];
      });
    },
    
    updateModalData: (type, data) => {
      set(state => {
        const modalIndex = state.activeModals.findIndex(modal => modal.type === type);
        if (modalIndex !== -1) {
          state.activeModals[modalIndex].data = {
            ...state.activeModals[modalIndex].data,
            ...data
          };
        }
      });
    },
    
    // Selectors
    isModalOpen: (type) => {
      return get().activeModals.some(modal => modal.type === type);
    },
    
    getModalData: (type) => {
      return get().activeModals.find(modal => modal.type === type)?.data;
    }
  }))
); 