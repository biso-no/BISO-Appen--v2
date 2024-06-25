import React, { useState, useEffect, useCallback } from 'react';
import { H1, YStack, Text, Stack, useTheme, styled } from 'tamagui';
import { capitalizeFirstLetter } from '@/lib/utils/helpers';


interface CampusSelectorProps {
  onSelect: (campus: string | null) => void;
  campus?: string;
}

const campuses: string[] = [
  "bergen",
  "oslo",
  "trondheim",
  "stavanger",
  "national"
];

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

const CampusSelector: React.FC<CampusSelectorProps> = ({ onSelect, campus }) => {
  const [selectedCampus, setSelectedCampus] = useState(campus ? campus : null);
  const theme = useTheme();


  const handleSelect = useCallback((campus: string) => {
    const newSelection = selectedCampus === campus ? null : campus;
    setSelectedCampus(newSelection);
    onSelect(newSelection);
  }, [selectedCampus, onSelect]);

  return (
    <YStack>
      {selectedCampus ? (
        <StyledCard
          key={selectedCampus}
          onPress={() => handleSelect(selectedCampus)}
          backgroundColor={theme.gray2}
        >
          <Text>{capitalizeFirstLetter(selectedCampus)}</Text>
        </StyledCard>
      ) : (
        campuses.map((campus) => (
          <StyledCard
            key={campus}
            onPress={() => handleSelect(campus)}
            backgroundColor={theme.gray1}
          >
            <Text>{capitalizeFirstLetter(campus)}</Text>
          </StyledCard>
        ))
      )}
    </YStack>
  );
};

export default CampusSelector;
