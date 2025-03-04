import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useWindowDimensions, useColorScheme, ColorSchemeName } from 'react-native';
import { YStack, Text, Stack, styled, useTheme, XStack, Button, ScrollView } from 'tamagui';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';
import { databases, getDocuments } from '@/lib/appwrite';
import { Models, Query } from 'react-native-appwrite';
import { Image } from 'tamagui';
import { MapPin } from '@tamagui/lucide-icons';
import { LinearGradient } from '@tamagui/linear-gradient';

interface CampusSelectorProps {
  onSelect: (campus: Models.Document | null) => void;
  campus?: string;
  initialCampus?: Models.Document;
}

const CampusCard = styled(Stack, {
  backgroundColor: '$background',
  borderRadius: '$6',
  borderWidth: 1,
  borderColor: '$borderColor',
  overflow: 'hidden',
  marginHorizontal: '$2',
  width: 160,
  animation: 'quick',
  pressStyle: {
    scale: 0.98,
  },
});

// Memoized campus card component
const CampusItem = React.memo(({ 
  campus,
  isSelected,
  onSelect,
  colorScheme,
  theme,
  image
}: { 
  campus: Models.Document;
  isSelected: boolean;
  onSelect: () => void;
  colorScheme: ColorSchemeName;
  theme: any;
  image: any;
}) => {
  const backgroundColor = colorScheme === 'dark' 
    ? isSelected ? '$blue7' : '$gray3'
    : isSelected ? '$blue2' : '$gray1';

  const borderColor = colorScheme === 'dark'
    ? isSelected ? '$blue5' : '$gray4'
    : isSelected ? '$blue5' : '$gray3';

  return (
    <Button
      unstyled
      onPress={onSelect}
    >
      <CampusCard
        backgroundColor={backgroundColor}
        borderColor={borderColor}
      >
        <Stack height={100} width="100%">
          <Image
            source={image}
            alt={`${campus.name} campus`}
            width="100%"
            height="100%"
            resizeMode="cover"
          />
          <LinearGradient
            start={[0, 0]}
            end={[0, 1]}
            fullscreen
            colors={[
              'rgba(0,0,0,0.1)',
              isSelected ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)'
            ]}
            position="absolute"
          />
        </Stack>
        <YStack 
          padding="$3"
          gap="$1"
        >
          <XStack gap="$2" alignItems="center">
            <MapPin 
              size={16} 
              color={isSelected ? 'white' : theme?.color?.val || '$color'} 
            />
            <Text
              fontSize={14}
              fontWeight="600"
              color={isSelected ? 'white' : '$color'}
              numberOfLines={1}
            >
              {capitalizeFirstLetter(campus.name)}
            </Text>
          </XStack>
        </YStack>
      </CampusCard>
    </Button>
  );
});

CampusItem.displayName = 'CampusItem';

const CampusSelector: React.FC<CampusSelectorProps> = ({ onSelect, campus, initialCampus }) => {
  const [selectedCampus, setSelectedCampus] = useState<Models.Document | null>(initialCampus ? initialCampus : null);
  const theme = useTheme();
  const [campuses, setCampuses] = useState<Models.DocumentList<Models.Document>>();
  const colorScheme = useColorScheme();

  const logoLight = require('@/assets/logo-light.png');
  const logoDark = require('@/assets/logo-dark.png');
  
  const CAMPUS_IMAGES = useMemo(() => ({
    'oslo': require('@/assets/images/campus-oslo.jpg'),
    'bergen': require('@/assets/images/campus-bergen.jpeg'),
    'trondheim': require('@/assets/images/campus-trd.jpeg'),
    'stavanger': require('@/assets/images/campus-stv.jpeg'),
    'national': colorScheme === 'dark' ? logoDark : logoLight,
  } as const), [colorScheme, logoDark, logoLight]);

  const handleSelect = useCallback((campus: Models.Document) => {
    const newSelection = selectedCampus?.$id === campus.$id ? null : campus;
    setSelectedCampus(newSelection);
    onSelect(newSelection);
  }, [selectedCampus, onSelect]);

  useEffect(() => {
    databases.listDocuments('app', 'campus', 
      [Query.select(['name', '$id'])]
    ).then(setCampuses);
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      paddingVertical="$2"
    >
      <XStack paddingHorizontal="$2">
        {campuses?.documents.map((campus) => (
          <CampusItem
            key={campus.$id}
            campus={campus}
            isSelected={selectedCampus?.$id === campus.$id}
            onSelect={() => handleSelect(campus)}
            colorScheme={colorScheme}
            theme={theme}
            image={CAMPUS_IMAGES[campus.name.toLowerCase() as keyof typeof CAMPUS_IMAGES] || CAMPUS_IMAGES.national}
          />
        ))}
      </XStack>
    </ScrollView>
  );
};

export default CampusSelector;
