import React, { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { 
  Popover, 
  Button, 
  Text, 
  YGroup, 
  Separator, 
  Spinner,
  Sheet,
  ScrollView,
  XStack,
  YStack,
  useTheme,
  Image
} from "tamagui";
import { ChevronDown, ChevronUp, MapPin } from "@tamagui/lucide-icons";
import { capitalizeFirstLetter } from "@/lib/utils/helpers";
import { databases } from "@/lib/appwrite";
import { Models, Query } from "react-native-appwrite";
import { useCampus } from "@/lib/hooks/useCampus";
import { useColorScheme } from 'react-native';

interface CampusPopoverProps {
  maxHeight?: number;
  buttonWidth?: number;
  buttonHeight?: number;
  gradientColors?: string[];
}

export default function CampusPopover({
  maxHeight = 300,
  buttonWidth = 180,
  buttonHeight = 40,
  gradientColors = ['$color', '$color2']
}: CampusPopoverProps) {
  const { campus, onChange } = useCampus();
  const [open, setOpen] = useState(false);
  const [campuses, setCampuses] = useState<Models.DocumentList<Models.Document> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();

  const colorScheme = useColorScheme();

  const logos = {
    light: require('@/assets/logo-light.png'),
    dark: require('@/assets/logo-dark.png')
  };

  const handleCampusChange = useCallback(async (newCampus: Models.Document) => {
    try {
      await onChange(newCampus);
      setOpen(false);
    } catch (err) {
      setError('Failed to update campus');
    }
  }, [onChange]);

  const fetchCampuses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await databases.listDocuments('app', 'campus', [
        Query.select(['name', '$id']),
      ]);
      setCampuses(data);
    } catch (err) {
      setError('Failed to load campuses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampuses();
  }, [fetchCampuses]);

  const buttonText = campus?.name 
    ? `${capitalizeFirstLetter(campus.name)}` 
    : 'Select Campus';

  const CampusList = () => (
    <YGroup gap="$2">
      {campuses?.documents.map((campusItem, index) => (
        <YGroup.Item key={campusItem.$id}>
          <Button
            onPress={() => handleCampusChange(campusItem)}
            chromeless
            hoverStyle={{ backgroundColor: '$backgroundHover' }}
            pressStyle={{ backgroundColor: '$backgroundPress' }}
          >
            <Text>{capitalizeFirstLetter(campusItem.name)}</Text>
          </Button>
          {index !== (campuses.documents.length - 1) && <Separator />}
        </YGroup.Item>
      ))}
    </YGroup>
  );

  if (loading) {
    return <Spinner size="large" />;
  }

  if (error) {
    return <Text color="$red10">{error}</Text>;
  }


    return (
      <YStack>
        <Button
          chromeless
          onPress={() => setOpen(true)}
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

        <Sheet
          modal
          open={open}
          onOpenChange={setOpen}
          snapPoints={[40]}
          position={0}
          dismissOnSnapToBottom
        >
          <Sheet.Overlay />
          <Sheet.Frame padding="$4">
            <Sheet.ScrollView>
              <YStack gap="$4">
                <Text fontSize={22} fontWeight="bold">Select Campus</Text>
                <CampusList />
              </YStack>
            </Sheet.ScrollView>
          </Sheet.Frame>
        </Sheet>
      </YStack>
    );
}