import React, { createContext, useState, useCallback } from 'react';

interface PaymentModalState {
  isOpen: boolean;
  price: number;
  tierId: string;
}

interface ModalContextType {
  modalState: PaymentModalState;
  openPaymentModal: (price: number, tierId: string) => void;
  closePaymentModal: () => void;
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<PaymentModalState>({
    isOpen: false,
    price: 0,
    tierId: '',
  });

  const openPaymentModal = useCallback((price: number, tierId: string) => {
    setModalState({
      isOpen: true,
      price,
      tierId,
    });
  }, []);

  const closePaymentModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return (
    <ModalContext.Provider value={{ modalState, openPaymentModal, closePaymentModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};
