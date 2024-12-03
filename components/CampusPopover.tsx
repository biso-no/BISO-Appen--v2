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
  YStack
} from "tamagui";
import { ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import { capitalizeFirstLetter } from "@/lib/utils/helpers";
import { databases } from "@/lib/appwrite";
import { Models, Query } from "react-native-appwrite";
import { useCampus } from "@/lib/hooks/useCampus";

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
    ? `BISO ${capitalizeFirstLetter(campus.name)}` 
    : 'Select Campus';

  const CampusList = () => (
    <YGroup space="$2">
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
          <XStack space="$2" alignItems="center">
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
              <YStack space="$4">
                <Text fontSize={18} fontWeight="bold">Select Campus</Text>
                <CampusList />
              </YStack>
            </Sheet.ScrollView>
          </Sheet.Frame>
        </Sheet>
      </YStack>
    );
}