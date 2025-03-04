import React from 'react';
import { MultiStepForm } from '@/components/tools/expenses/create/stepper';
import { View } from 'tamagui';

export default function CreateExpenseScreen() {
  return (
    <View flex={1}>
      <MultiStepForm />
    </View>
  );
}