import React, { useState, useEffect } from 'react';
import { useRouter } from "expo-router";
import { Models } from "react-native-appwrite";
import RenderHTML from "react-native-render-html";
import { 
  YStack, 
  Card, 
  Paragraph, 
  Image, 
  ScrollView, 
  XStack,
  H2,
  H3, 
  Text,
  useTheme,
  Button
} from "tamagui";
import { ChevronRight } from "@tamagui/lucide-icons";
import { MyStack } from "@/components/ui/MyStack";
import { getDepartments } from "@/lib/appwrite";
import { useCampus } from "@/lib/hooks/useCampus";
import { MotiView } from 'moti';
import { useWindowDimensions } from 'react-native';

const truncateHTML = (html: string, maxLength = 50) => {
  const strippedText = html.replace(/<[^>]+>/g, '');
  if (strippedText.length <= maxLength) return html;
  
  let truncated = strippedText.substr(0, maxLength);
  truncated = truncated.substr(0, Math.min(truncated.length, truncated.lastIndexOf(" ")));
  return truncated + "...";
};

export default function DepartmentsScreen() {
  const [departments, setDepartments] = useState<Models.DocumentList<Models.Document>>();
  const { campus } = useCampus();
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();

  useEffect(() => {
    async function fetchDepartments() {
      const deps = await getDepartments(campus?.$id);
      setDepartments(deps);
    }
    fetchDepartments();
  }, [campus?.$id]);

  const htmlStyles = {
    body: { 
      fontSize: 14, 
      color: theme?.color?.val,
      opacity: 0.8,
    },
  };

  return (
    <ScrollView>
      <MyStack space="$4" padding="$4">
        <YStack space="$2">
          <H2>Our Departments</H2>
          <Paragraph>Explore the various departments at {campus?.name}</Paragraph>
        </YStack>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
        >
          <YStack space="$4">
            {departments?.documents.map((department, index) => (
              <MotiView
                key={department.$id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 500, delay: index * 100 }}
              >
                <Card
                  elevate
                  bordered
                  animation="bouncy"
                  scale={0.95}
                  hoverStyle={{ scale: 0.98 }}
                  pressStyle={{ scale: 0.95 }}
                  onPress={() => router.push(`/explore/units/${department.$id}`)}
                >
                  <Card.Header padded>
                    <XStack space="$3" alignItems="center" justifyContent="space-between" width="100%">
                      <XStack space="$3" alignItems="center" flex={1}>
                        <Image
                          source={{ uri: department.logo }}
                          alt={`${department.Name} icon`}
                          width={50}
                          height={50}
                          borderRadius="$2"
                        />
                        <YStack flex={1} space="$1">
                          <H3 numberOfLines={1} ellipsizeMode="tail">{department.Name}</H3>
                          {department.description && (
                              <RenderHTML 
                                source={{ html: truncateHTML(department.description) }}
                                contentWidth={width - 150}
                                tagsStyles={htmlStyles}
                              />
                          )}
                        </YStack>
                      </XStack>
                      <ChevronRight size={20} color={theme?.color?.val} />
                    </XStack>
                  </Card.Header>
                </Card>
              </MotiView>
            ))}
          </YStack>
        </MotiView>
      </MyStack>
    </ScrollView>
  );
}