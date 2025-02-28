import React, { useState, useEffect, useCallback } from 'react';
import { H1, YStack, Text, Stack, useTheme, styled } from 'tamagui';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';
import { getDocuments } from '@/lib/appwrite';
import { Models } from 'react-native-appwrite';


interface CampusSelectorProps {
  onSelect: (campus: Models.Document | null) => void;
  campus?: string;
  initialCampus?: Models.Document;
}


const StyledCard = styled(Stack, {
  cursor: 'pointer',
  margin: 10,
  padding: 20,
  borderRadius: 10,
  animation: 'medium',
  hoverStyle: {
    scale: 1.05,
  },
  pressStyle: {
    scale: 0.95,
  },
});

const CampusSelector: React.FC<CampusSelectorProps> = ({ onSelect, campus, initialCampus }) => {
  const [selectedCampus, setSelectedCampus] = useState<Models.Document | null>(initialCampus ? initialCampus : null);
  const theme = useTheme();
  const [campuses, setCampuses] = useState<Models.DocumentList<Models.Document>>();


  const handleSelect = useCallback((campus: Models.Document) => {
    const newSelection = selectedCampus?.$id === campus.$id ? null : campus;
    setSelectedCampus(newSelection);
    onSelect(newSelection);
  }, [selectedCampus, onSelect]);

  useEffect(() => {
    getDocuments('campus').then(setCampuses);
  }, []);

  return (
    <YStack>
      {campuses?.documents.map((campus) => (
        <StyledCard
          key={campus.$id}
          onPress={() => handleSelect(campus)}
          backgroundColor={selectedCampus?.$id === campus.$id ? theme.gray2 : theme.gray1}
        >
          <Text>{capitalizeFirstLetter(campus.name)}</Text>
        </StyledCard>
      ))}
    </YStack>
  );
};

export default CampusSelector;
