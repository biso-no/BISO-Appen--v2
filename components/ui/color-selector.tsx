import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { XStack, YStack, Text, Button, Sheet } from 'tamagui';
import { Palette } from '@tamagui/lucide-icons';

// Define color swatches mapping for simplicity
const COLOR_GROUPS = {
  blue: ['blue1', 'blue2', 'blue3', 'blue4', 'blue5', 'blue6', 'blue7', 'blue8', 'blue9', 'blue10', 'blue11'],
  green: ['green1', 'green2', 'green3', 'green4', 'green5', 'green6', 'green7', 'green8', 'green9', 'green10', 'green11'],
  purple: ['purple1', 'purple2', 'purple3', 'purple4', 'purple5', 'purple6', 'purple7', 'purple8', 'purple9', 'purple10', 'purple11'],
  orange: ['orange1', 'orange2', 'orange3', 'orange4', 'orange5', 'orange6', 'orange7', 'orange8', 'orange9', 'orange10', 'orange11'],
  pink: ['pink1', 'pink2', 'pink3', 'pink4', 'pink5', 'pink6', 'pink7', 'pink8', 'pink9', 'pink10', 'pink11'],
};

interface ColorSelectorProps {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorSelector({ value, onChange }: ColorSelectorProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(0);
  
  return (
    <>
      <Button
        icon={Palette}
        theme={value ? value.replace(/[0-9]+$/, '') : 'blue'}
        onPress={() => setOpen(true)}
        size="$4"
      >
        {value ? value.replace(/[0-9]+$/, '') : 'Select Color'}
      </Button>
      
      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[50, 80]}
        position={position}
        onPositionChange={setPosition}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay animation="lazy" />
        <Sheet.Frame padding="$4">
          <Sheet.Handle />
          
          <Text fontSize="$6" fontWeight="bold" marginBottom="$4">
            Select Color
          </Text>
          
          <ScrollView style={styles.colorScroll}>
            <YStack space="$4" paddingBottom="$8">
              {Object.entries(COLOR_GROUPS).map(([colorType, colorKeys]) => (
                <YStack key={colorType} space="$2">
                  <Text
                    fontWeight="bold"
                    textTransform="capitalize"
                    fontSize="$4"
                  >
                    {colorType}
                  </Text>
                  
                  <XStack flexWrap="wrap" gap="$2">
                    {colorKeys.map(colorKey => {
                      return (
                        <TouchableOpacity
                          key={colorKey}
                          style={[
                            styles.colorSwatch,
                            { 
                              borderWidth: colorKey === value ? 3 : 0,
                              backgroundColor: `$${colorKey}` 
                            }
                          ]}
                          onPress={() => {
                            onChange(colorKey);
                            setOpen(false);
                          }}
                        >
                          {colorKey === value && (
                            <Text color="white" fontWeight="bold" textAlign="center">
                              ✓
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </XStack>
                </YStack>
              ))}
            </YStack>
          </ScrollView>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  colorScroll: {
    maxHeight: 500,
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'white',
  },
}); 