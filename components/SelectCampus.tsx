import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useWindowDimensions, useColorScheme, ColorSchemeName } from 'react-native';
import { YStack, Text, Stack, styled, useTheme, XStack, Button, ScrollView } from 'tamagui';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';
import { databases, getDocuments } from '@/lib/appwrite';
import { Models, Query } from 'react-native-appwrite';
import { Image } from 'tamagui';
import { MapPin, Check } from '@tamagui/lucide-icons';
import { LinearGradient } from '@tamagui/linear-gradient';
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';

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
  margin: '$1',
  flex: 1,
  minWidth: 140,
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
  image,
  width
}: { 
  campus: Models.Document;
  isSelected: boolean;
  onSelect: () => void;
  colorScheme: ColorSchemeName;
  theme: any;
  image: any;
  width: number;
}) => {
  const backgroundColor = colorScheme === 'dark' 
    ? isSelected ? '$blue7' : '$gray3'
    : isSelected ? '$blue2' : '$gray1';

  const borderColor = colorScheme === 'dark'
    ? isSelected ? '$blue5' : '$gray4'
    : isSelected ? '$blue5' : '$gray3';

  return (
      <CampusCard
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        onPress={onSelect}
      >
        <Stack height={80} width="100%">
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
          {isSelected && (
            <XStack 
              position="absolute" 
              top={5} 
              right={5} 
              backgroundColor="$blue8" 
              borderRadius="$full" 
              padding="$1"
            >
              <Check size={14} color="white" />
            </XStack>
          )}
        </Stack>
        <YStack 
          padding="$2"
          gap="$1"
        >
          <XStack gap="$1" alignItems="center">
            <MapPin 
              size={14} 
              color={isSelected ? 'white' : theme?.color?.val || '$color'} 
            />
            <Text
              fontSize={13}
              fontWeight="600"
              color={isSelected ? 'white' : '$color'}
              numberOfLines={1}
            >
              {capitalizeFirstLetter(campus.name)}
            </Text>
          </XStack>
        </YStack>
      </CampusCard>
  );
});

CampusItem.displayName = 'CampusItem';

const CampusSelector: React.FC<CampusSelectorProps> = ({ onSelect, campus, initialCampus }) => {
  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(initialCampus?.$id || null);
  const theme = useTheme();
  const [campuses, setCampuses] = useState<Models.DocumentList<Models.Document>>();
  const colorScheme = useColorScheme();
  const { width: screenWidth } = useWindowDimensions();

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
    // Update the selected campus ID
    setSelectedCampusId(campus.$id);
    // Call the onSelect callback with the campus
    onSelect(campus);
  }, [onSelect]);

  useEffect(() => {
    databases.listDocuments('app', 'campus', 
      [Query.select(['name', '$id'])]
    ).then(setCampuses);
  }, []);

  // Update selected campus when initialCampus changes
  useEffect(() => {
    if (initialCampus) {
      setSelectedCampusId(initialCampus.$id);
    }
  }, [initialCampus]);

  // Calculate item width based on screen size
  const itemWidth = (screenWidth - 32) / 2; // 32px for padding (16px on each side)

  // Group campuses into pairs for the grid
  const campusPairs = useMemo(() => {
    if (!campuses?.documents) return [];
    
    const pairs = [];
    for (let i = 0; i < campuses.documents.length; i += 2) {
      pairs.push(campuses.documents.slice(i, i + 2));
    }
    return pairs;
  }, [campuses]);

  return (
    <YStack padding="$2">
      <XStack flexWrap="wrap" justifyContent="space-between">
        {campuses?.documents.map((campusItem) => (
          <Stack key={campusItem.$id} width="48%" marginBottom="$2">
            <CampusItem
              campus={campusItem}
              isSelected={selectedCampusId === campusItem.$id}
              onSelect={() => handleSelect(campusItem)}
              colorScheme={colorScheme}
              theme={theme}
              image={CAMPUS_IMAGES[campusItem.name.toLowerCase() as keyof typeof CAMPUS_IMAGES] || CAMPUS_IMAGES.national}
              width={itemWidth}
            />
          </Stack>
        ))}
      </XStack>
    </YStack>
  );
};

export default CampusSelector;
