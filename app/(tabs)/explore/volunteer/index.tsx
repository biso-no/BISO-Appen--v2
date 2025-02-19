import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { MotiView } from 'moti';
import RenderHTML from "react-native-render-html";
import { Image } from 'react-native';
import { 
  Text, 
  YStack, 
  XStack,
  useTheme, 
  Card, 
  Separator, 
  ScrollView, 
  Button, 
  Spinner,
  H2,
  Paragraph
} from "tamagui";
import { ChevronRight, Briefcase } from "@tamagui/lucide-icons";
import { useCampus } from "@/lib/hooks/useCampus";
import { Models } from "react-native-appwrite";

export default function VolunteerScreen() {
  const [jobs, setJobs] = useState<Models.Document[]>([]);
  const theme = useTheme();
  const { campus } = useCampus();
  const textColor = theme?.color?.val;
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const htmlStyles = {
    body: { 
      fontSize: 16, 
      lineHeight: 24, 
      color: textColor,
    },
  };

  useEffect(() => {
    axios.get(`https://biso.no/wp-json/custom/v1/jobs/?includeExpired=true&per_page=10&campus=${campus?.name}`)
      .then((response) => {
        setJobs(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching jobs:", error);
        setLoading(false);
      });
  }, [campus]);
  
  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" />
      </YStack>
    );
  }

  return (
    <ScrollView>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
      >
        <YStack gap="$4" padding="$4">
          <H2>Available Positions</H2>
          <Paragraph>Explore volunteer opportunities at {campus?.name}</Paragraph>
          
          {jobs.length > 0 ? (
            <YStack gap="$4">
            {jobs.map((job, index) => (
              <Card 
                key={job.id} 
                elevate 
                bordered
                animation="bouncy"
                scale={0.9}
                hoverStyle={{ scale: 0.95 }}
                pressStyle={{ scale: 0.9 }}
                onPress={() => router.push(`/explore/volunteer/${job.id}`)}
              >
                <Card.Header padded>
                  <XStack gap="$2" alignItems="center">
                    <Briefcase size={20} color={theme?.color?.val} />
                    <RenderHTML
                      source={{ html: job.title }}
                      contentWidth={300}
                      tagsStyles={htmlStyles}
                    />
                  </XStack>
                </Card.Header>
                <Card.Footer padded>
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize={14} color={theme?.color?.val} opacity={0.8}>
                      Click to view details
                    </Text>
                    <ChevronRight size={20} color={theme?.color?.val} />
                  </XStack>
                </Card.Footer>
              </Card>
            ))}
          </YStack>
          )  : (
            <Card padding="$4" alignItems="center" gap="$4">
              <Text fontSize={24} color={textColor} textAlign="center">
                No jobs available at the moment
              </Text>
              <Text fontSize={16} color={textColor} textAlign="center">
                Please check back later for new opportunities.
              </Text>
              <Button
                themeInverse
                onPress={() => router.push('/explore')}
              >
                Explore Other Options
              </Button>
            </Card>
          )}
          </YStack>
          </MotiView>
    </ScrollView>
  );
  }