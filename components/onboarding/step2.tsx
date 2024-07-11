import { View } from 'tamagui';
import React from 'react';
import CampusSelector from '@/components/SelectCampus';
import { MotiView } from 'moti';
import { useAuth } from '../context/auth-provider';

interface Step2Props {
  onNext?: () => void | Promise<void>;
}

export function Step2({ onNext }: Step2Props) {
  const { updateUserPrefs } = useAuth();

  const handleCampusChange = (campus: string | null) => {
    if (campus) {
      updateUserPrefs('campus', campus);
    }
    if (onNext) {
      onNext();
    }
  };

  return (
    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <View>
        <CampusSelector onSelect={handleCampusChange} />
      </View>
    </MotiView>
  );
};
