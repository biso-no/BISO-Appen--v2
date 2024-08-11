import { View } from 'tamagui';
import React from 'react';
import { Input } from 'tamagui';
import { MotiView } from 'moti';

interface Step1Props {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  onNext?: () => void;
}

export function Step1({ name, setName, onNext }: Step1Props) {
  const handleNameChange = (name: string) => {
    setName(name);
    if (onNext) {
      onNext();
    }
  };

  return (
    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <View>
        <Input
          id="name"
          placeholder="Enter your name"
          value={name}
          backgroundColor={"transparent"}
          onChangeText={handleNameChange}
          size="4"
          width="$18"
        />
      </View>
    </MotiView>
  );
};
