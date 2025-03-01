import React, { createContext, useContext, useState, useCallback } from 'react';
import { Sheet, Dialog, YStack, View } from 'tamagui';

type ModalType = 'sheet' | 'dialog';

interface ModalConfig {
  type: ModalType;
  id: string;
  component: () => React.ReactNode;
  props?: {
    snapPoints?: Array<number>;
    dismissOnSnapToBottom?: boolean;
    position?: number;
    zIndex?: number;
    animation?: string;
    [key: string]: any;
  };
}

interface ModalContextType {
  showModal: (config: ModalConfig) => void;
  hideModal: (id: string) => void;
  hideAllModals: () => void;
  activeModals: Record<string, ModalConfig>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [activeModals, setActiveModals] = useState<Record<string, ModalConfig>>({});

  const showModal = useCallback((config: ModalConfig) => {
    setActiveModals(prev => ({
      ...prev,
      [config.id]: config
    }));
  }, []);

  const hideModal = useCallback((id: string) => {
    setActiveModals(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const hideAllModals = useCallback(() => {
    setActiveModals({});
  }, []);

  return (
    <ModalContext.Provider value={{ showModal, hideModal, hideAllModals, activeModals }}>
      {children}
      <ModalRenderer />
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModals must be used within a ModalProvider');
  }
  return context;
}

// Component that renders all active modals
function ModalRenderer() {
  const { activeModals, hideModal } = useModals();

  return (
    <>
      {Object.entries(activeModals).map(([id, config]) => {
        if (config.type === 'sheet') {
          const defaultProps = {
            snapPoints: [50],
            position: 0,
            dismissOnSnapToBottom: true,
            zIndex: 100000
          };
          
          const sheetProps = { ...defaultProps, ...config.props };
          
          return (
            <Sheet
              key={id}
              modal
              open={true}
              onOpenChange={(isOpen: boolean) => !isOpen && hideModal(id)}
              {...sheetProps}
            >
              <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
              <Sheet.Handle />
              <Sheet.Frame padding="$4">
                {config.component()}
              </Sheet.Frame>
            </Sheet>
          );
        } else if (config.type === 'dialog') {
          return (
            <Dialog 
              key={id} 
              modal 
              open={true} 
              onOpenChange={(isOpen: boolean) => !isOpen && hideModal(id)}
              {...config.props}
            >
              <Dialog.Portal>
                <Dialog.Overlay
                  key="overlay"
                  animation="quick"
                  opacity={0.5}
                  enterStyle={{ opacity: 0 }}
                  exitStyle={{ opacity: 0 }}
                />
                <Dialog.Content
                  bordered
                  elevate
                  key="content"
                  animation={[
                    'quick',
                    {
                      opacity: {
                        overshootClamping: true,
                      },
                    },
                  ]}
                  enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
                  exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
                  gap="$4"
                >
                  {config.component()}
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog>
          );
        }
        
        // Handle other modal types
        return null;
      })}
    </>
  );
} 