import React, { useState, useMemo } from 'react';
import { Check, ChevronDown, ChevronUp } from '@tamagui/lucide-icons';
import { Select, YStack, Sheet, Adapt } from 'tamagui';
import { LinearGradient } from 'tamagui/linear-gradient'

export interface CustomSelectProps {
  items: { name: string }[];
  onValueChange: (value: string) => void;
  label?: string;
  initialSelected?: string;
}

export const CustomSelect = ({ items, onValueChange, label, initialSelected }: CustomSelectProps) => {
  const [selectedValue, setSelectedValue] = useState(initialSelected || items[0].name.toLowerCase());

  return (
    <Select
      defaultValue={selectedValue}
      onValueChange={(value) => {
        setSelectedValue(value);
        onValueChange(value);
      }}
    >
      <Select.Trigger
        iconAfter={ChevronDown}
        flex={1}
        >
            <Select.Value placeholder={label} />
        </Select.Trigger>
        
        <Adapt platform="touch">
            <Sheet
            modal
            dismissOnSnapToBottom
            animationConfig={{
                type: 'spring',
                damping: 20,
                mass: 1.2,
                stiffness: 250,
            }}
            >
                <Sheet.Frame>
                    <Sheet.ScrollView>
                        <Adapt.Contents />
                    </Sheet.ScrollView>
                </Sheet.Frame>
                <Sheet.Overlay
                animation="lazy"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
                />
            </Sheet>
        </Adapt>

        <Select.Content zIndex={200000}>
            <Select.ScrollUpButton
                alignItems='center'
                justifyContent='center'
                position='relative'
                width='100%'
                >
                    <YStack zIndex={10}>
                        <ChevronUp size={20} />
                    </YStack>
                    <LinearGradient
                        start={[0, 0]}
                        end={[0, 1]}
                        fullscreen
                        colors={['$background', 'transparent']}
                        borderRadius="$4"
                    />
            </Select.ScrollUpButton>

            <Select.Viewport
            minWidth={200}
            >
                <Select.Group>
                    <Select.Label>{label}</Select.Label>
                    {useMemo(
              () =>
                items.map((item, i) => {
                  return (
                    <Select.Item
                      index={i}
                      key={item.name}
                      value={item.name.toLowerCase()}
                    >
                      <Select.ItemText>{item.name}</Select.ItemText>
                      <Select.ItemIndicator>
                        <Check />
                      </Select.ItemIndicator>
                    </Select.Item>
                  )
                }),
              [items],
            )}
                </Select.Group>
            </Select.Viewport>
            <Select.ScrollDownButton
                alignItems='center'
                justifyContent='center'
                position='relative'
                width='100%'
                >
                    <YStack zIndex={10}>
                        <ChevronDown size={20} />
                    </YStack>
                    <LinearGradient
                        start={[0, 0]}
                        end={[0, 1]}
                        fullscreen
                        colors={['$background', 'transparent']}
                        borderRadius="$4"
                    />
            </Select.ScrollDownButton>
        </Select.Content>
    </Select>
  )
}