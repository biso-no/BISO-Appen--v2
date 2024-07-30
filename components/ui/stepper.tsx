import React, { createContext, ReactNode, useContext, useState } from 'react';
import { View, Button, YStack, XStack } from 'tamagui';

interface StepProps {
  children: ReactNode;
  onNext?: () => void | Promise<void>;
  stepIndex?: number; // Make stepIndex optional
}

interface StepsContextProps {
  currentStep: number;
  next: () => void;
  back: () => void;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

const StepsContext = createContext<StepsContextProps | undefined>(undefined);

export function Steps({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => setCurrentStep((prev) => prev + 1);
  const back = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <StepsContext.Provider value={{ currentStep, next, back, setCurrentStep }}>
      <YStack flex={1} justifyContent="center" alignItems="center">
        {React.Children.map(children, (child, index) =>
          React.isValidElement<StepProps>(child)
            ? React.cloneElement(child, { stepIndex: index })
            : child
        )}
      </YStack>
    </StepsContext.Provider>
  );
};

const StepComponent: React.FC<StepProps> = ({ children, onNext, stepIndex }) => {
  const context = useContext(StepsContext);

  if (!context) {
    throw new Error('Step must be used within a StepsProvider');
  }

  const { currentStep, next, back } = context;

  return (
    <View style={{ display: currentStep === stepIndex ? 'flex' : 'none' }}>
      {children}
      <XStack position="absolute" bottom={0} left={0} right={0} justifyContent="space-between" padding="$4">
        {currentStep > 0 && <Button onPress={back}>Back</Button>}
        <Button onPress={onNext ? onNext : next}>{currentStep === stepIndex ? 'Submit' : 'Next'}</Button>
      </XStack>
    </View>
  );
};

export const Step: React.FC<Omit<StepProps, 'stepIndex'>> = ({ children, onNext }) => (
  <StepComponent onNext={onNext}>
    {children}
  </StepComponent>
);

Steps.Step = Step;
