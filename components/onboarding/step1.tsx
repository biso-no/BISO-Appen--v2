import { View } from 'tamagui';
import React, { useState } from 'react';
import { Input } from 'tamagui';
import { MotiView } from 'moti';

interface Step1Props {
    onNext: () => void;
}

export function Step1({ onNext }: Step1Props) {

    const [name, setName] = useState('');
    
    const handleNameChange = (name: string) => {
      setName(name);
    };
    
    if (onNext) {
      onNext();
    };

  return (
    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <View>
        <Input
          id="name"
          placeholder="Enter your name"
          value={name}
          onChangeText={handleNameChange}
          size="4"
        />
      </View>
    </MotiView>
  );
};
