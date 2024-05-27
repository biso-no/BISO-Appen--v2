import React, { useState } from 'react';
import { H1, YStack, Text, Stack, useTheme, styled } from 'tamagui';

interface Campus {
  id: string;
  name: string;
}

interface CampusSelectorProps {
  onSelect: (campus: string | null) => void;
}

const campuses: Campus[] = [
  { id: 'bergen', name: 'Bergen' },
  { id: 'oslo', name: 'Oslo' },
  { id: 'trondheim', name: 'Trondheim' },
  { id: 'stavanger', name: 'Stavanger' },
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

const CampusSelector: React.FC<CampusSelectorProps> = ({ onSelect }) => {
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const theme = useTheme();

  const handleSelect = (campus: Campus) => {
    const newSelection = selectedCampus?.id === campus.id ? null : campus;
    setSelectedCampus(newSelection);
    onSelect(newSelection?.id || null);
  };

  return (
    <YStack>
      {selectedCampus ? (
        <StyledCard
          key={selectedCampus.id}
          onPress={() => handleSelect(selectedCampus)}
          backgroundColor={theme.gray2}
        >
          <Text>{selectedCampus.name}</Text>
        </StyledCard>
      ) : (
        campuses.map((campus) => (
          <StyledCard
            key={campus.id}
            onPress={() => handleSelect(campus)}
            backgroundColor={theme.gray1}
          >
            <Text>{campus.name}</Text>
          </StyledCard>
        ))
      )}
    </YStack>
  );
};

export default CampusSelector;
