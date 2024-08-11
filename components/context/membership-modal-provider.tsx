import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MembershipModal } from '../membership-modal';

interface ModalContextType {
  openModal: () => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <MembershipModal open={open} setOpen={setOpen} />
    </ModalContext.Provider>
  );
};

const useModal = () => {
  const context = useContext(ModalContext);
  console.log("Opening modal.")
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export { ModalProvider, useModal };
