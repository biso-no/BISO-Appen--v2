import React, { useCallback, useEffect, useState } from 'react';
import { Button, XStack, Text, Image, YStack, Spinner } from 'tamagui';
import { ChevronDown } from '@tamagui/lucide-icons';
import { useColorScheme } from 'react-native';
import { useCampusContext } from '@/components/context/core/campus-provider';
import { useModals } from '@/components/context/core/modal-manager';
import { CampusSelector } from '@/components/modals/CampusSelector';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';
import { useTranslation } from 'react-i18next';

interface CampusPopoverProps {
  maxHeight?: number;
  buttonWidth?: number;
  buttonHeight?: number;
  gradientColors?: string[];
  snapPoints?: number[];
  sheetTitle?: string;
}

export default function CampusPopover({
  maxHeight = 300,
  buttonWidth = 180,
  buttonHeight = 40,
  gradientColors = ['$color', '$color2'],
  snapPoints = [50],
  sheetTitle
}: CampusPopoverProps) {
  const { currentCampus, isLoading, error } = useCampusContext();
  const { showModal, hideModal } = useModals();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const logos = {
    light: require('@/assets/logo-light.png'),
    dark: require('@/assets/logo-dark.png')
  };

  // Default title from translation
  const defaultSheetTitle = t('select-campus');
  
  // Use the provided sheet title or the translated one
  const [translatedSheetTitle, setTranslatedSheetTitle] = useState(
    sheetTitle || defaultSheetTitle
  );
  
  // Update translated title when language changes
  useEffect(() => {
    setTranslatedSheetTitle(sheetTitle || defaultSheetTitle);
  }, [sheetTitle, defaultSheetTitle]);

  const handleOpenPress = useCallback(() => {
    const modalId = 'campus-selector';
    
    showModal({
      id: modalId,
      type: 'sheet',
      component: () => (
        <CampusSelector 
          onClose={() => hideModal(modalId)} 
          title={translatedSheetTitle}
        />
      ),
      props: {
        snapPoints,
        dismissOnSnapToBottom: true,
        zIndex: 100000
      }
    });
  }, [hideModal, showModal, snapPoints, translatedSheetTitle]);

  const buttonText = currentCampus?.name 
    ? `${capitalizeFirstLetter(currentCampus.name)}` 
    : t('select-campus');

  if (isLoading) {
    return <Spinner size="large" />;
  }

  if (error) {
    return <Text color="$red10">{error}</Text>;
  }

  return (
    <YStack>
      <Button
        chromeless
        onPress={handleOpenPress}
        style={{
          width: buttonWidth,
          height: buttonHeight,
        }}
      >
        <XStack gap="$2" alignItems="center">
          <Image
            source={logos[colorScheme === 'dark' ? 'dark' : 'light']}
            style={{ width: 36, height: 36 }}
          />
          <Text>{buttonText}</Text>
          <ChevronDown />
        </XStack>
      </Button>
    </YStack>
  );
}