import React from 'react';
import { MultiStepForm } from '@/components/tools/expenses/create/stepper';
import { ScrollView, View } from 'tamagui';

export default function CreateExpenseScreen() {
  return (
    <ScrollView flex={1} contentContainerStyle={{ paddingBottom: 80 }}>
      <MultiStepForm />
    </ScrollView>
  );
}