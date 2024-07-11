import { View } from 'tamagui';
import React, { useState } from 'react';
import DepartmentSelector from '@/components/SelectDepartments';
import { MotiView } from 'moti';

interface Step3Props {
  campus?: string;
  onNext?: () => void | Promise<void>;
}

export function Step3({ campus, onNext }: Step3Props) {
    
  const [departments, setDepartments] = useState<string[]>([]);

  const handleDepartmentChange = (departments: string[]) => {
    setDepartments(departments);
    if (onNext) {
      onNext();
    }
  };

  return (
    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <View>{campus && <DepartmentSelector campus={campus} onSelect={handleDepartmentChange} />}</View>
    </MotiView>
  );
};

