import React, { useEffect, useState } from 'react';
import { Popover, Button, Text, YGroup, XStack, Separator, Spinner, Theme, ScrollView } from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";
import { useCampus } from "@/lib/hooks/useCampus";
import { ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import { capitalizeFirstLetter } from "@/lib/utils/helpers";
import { databases, getDocuments } from "@/lib/appwrite";
import { Models, Query } from "react-native-appwrite";
import MaskedView from '@react-native-masked-view/masked-view';

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

  const handleCampusChange = async (newCampus: Models.Document) => {
    await onChange(newCampus);
    setOpen(false);
  };

  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const data = await databases.listDocuments('app', 'campus', [
          Query.select(['name', '$id']),
        ]);
        setCampuses(data);
      } catch (err) {
        setError('Failed to load campuses');
      } finally {
        setLoading(false);
      }
    };

    fetchCampuses();
  }, []);

  const renderButton = () => (
    <XStack 
      alignItems="center" 
      justifyContent="center"
      padding="$2"
      borderRadius="$4"
      width={buttonWidth}
      height={buttonHeight}
    >
      <Text 
        adjustsFontSizeToFit 
        numberOfLines={1} 
        style={{ fontWeight: 'bold' }}
      >
        {campus?.name ? `BISO ${capitalizeFirstLetter(campus.name)}` : 'Select Campus'}
      </Text>
      {open ? (
        <ChevronUp color="white" />
      ) : (
        <ChevronDown color="white" />
      )}
    </XStack>
  );

  const renderContent = () => {
    if (loading) return <Spinner size="large" />;
    if (error) return <Text color="$red10">{error}</Text>;
    if (!campuses || campuses.documents.length === 0) return <Text>No campuses available</Text>;

    return (
        <YGroup space="$2">
          {campuses.documents.map((campus, index) => (
            <YGroup.Item key={campus.$id}>
              <Button
                onPress={() => handleCampusChange(campus)}
                chromeless
                hoverStyle={{ backgroundColor: '$backgroundHover' }}
                pressStyle={{ backgroundColor: '$backgroundPress' }}
              >
                <Text>{capitalizeFirstLetter(campus.name)}</Text>
              </Button>
              {index !== campuses.documents.length - 1 && <Separator />}
            </YGroup.Item>
          ))}
        </YGroup>
    );
  };

  return (
      <Popover size="$4" open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button
            chromeless
            onPress={() => setOpen(!open)}
          >
           {campus?.name ? `BISO ${capitalizeFirstLetter(campus.name)}` : 'Select Campus'}
           {open ? (
        <ChevronUp />
      ) : (
        <ChevronDown />
      )}
          </Button>
        </Popover.Trigger>
        <Popover.Content
          elevate
          animation={[
            'quick',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
        >
        <YGroup space="$2">
          {campuses?.documents.map((campus, index) => (
            <YGroup.Item key={campus.$id}>
              <Button
                onPress={() => handleCampusChange(campus)}
                chromeless
                hoverStyle={{ backgroundColor: '$backgroundHover' }}
                pressStyle={{ backgroundColor: '$backgroundPress' }}
              >
                <Text>{capitalizeFirstLetter(campus.name)}</Text>
              </Button>
              {index !== campuses.documents.length - 1 && <Separator />}
            </YGroup.Item>
          ))}
        </YGroup>
        </Popover.Content>
      </Popover>
  );
}