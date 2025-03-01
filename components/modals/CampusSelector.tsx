import React from 'react';
import { YStack, Text, Button, YGroup, Separator, XStack } from 'tamagui';
import { useCampusContext } from '@/components/context/core/campus-provider';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';
import { Models } from 'react-native-appwrite';

interface CampusSelectorProps {
  onClose: () => void;
  title?: string;
}

export function CampusSelector({ onClose, title = 'Select Campus' }: CampusSelectorProps) {
  try {
    const { campuses, currentCampus, changeCampus } = useCampusContext();

    const handleCampusChange = async (campus: Models.Document) => {
      try {
        await changeCampus(campus);
        onClose();
      } catch (err) {
        console.error('Failed to update campus', err);
      }
    };

    if (!campuses) {
      return (
        <YStack gap="$4">
          <Text fontSize={22} fontWeight="bold">{title}</Text>
          <Text color="$red10">No campuses available. Please try again later.</Text>
          <Button alignSelf="flex-end" onPress={onClose} theme="accent">
            Close
          </Button>
        </YStack>
      );
    }

    return (
      <YStack gap="$4">
        <Text fontSize={22} fontWeight="bold">{title}</Text>
        <YGroup gap="$2">
          {campuses.map((campusItem, index) => (
            <YGroup.Item key={campusItem.$id}>
              <Button
                onPress={() => handleCampusChange(campusItem)}
                chromeless
                hoverStyle={{ backgroundColor: '$backgroundHover' }}
                pressStyle={{ backgroundColor: '$backgroundPress' }}
              >
                <XStack alignItems="center" gap="$2">
                  <Text>{capitalizeFirstLetter(campusItem.name)}</Text>
                  {currentCampus?.$id === campusItem.$id && (
                    <Text fontSize="$1" opacity={0.5}>(Current)</Text>
                  )}
                </XStack>
              </Button>
              {index !== (campuses.length - 1) && <Separator />}
            </YGroup.Item>
          ))}
        </YGroup>
      </YStack>
    );
  } catch (error) {
    console.error('Error in CampusSelector:', error);
    return (
      <YStack gap="$4">
        <Text fontSize={22} fontWeight="bold">{title}</Text>
        <Text color="$red10">An error occurred. Please try again later.</Text>
        <Button alignSelf="flex-end" onPress={onClose} theme="accent">
          Close
        </Button>
      </YStack>
    );
  }
} 