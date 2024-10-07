import React, { useState, useEffect, useCallback } from 'react';
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
  Button,
  Spinner
} from "tamagui";
import { ChevronRight } from "@tamagui/lucide-icons";
import { MyStack } from "@/components/ui/MyStack";
import { getDepartments } from "@/lib/appwrite";
import { useCampus } from "@/lib/hooks/useCampus";
import { MotiView } from 'moti';
import { useWindowDimensions } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

const truncateHTML = (html: string, maxLength = 50) => {
  const strippedText = html.replace(/<[^>]+>/g, '');
  if (strippedText.length <= maxLength) return html;
  
  let truncated = strippedText.substr(0, maxLength);
  truncated = truncated.substr(0, Math.min(truncated.length, truncated.lastIndexOf(" ")));
  return truncated + "...";
};

export default function DepartmentsScreen() {
  const [departments, setDepartments] = useState<Models.Document[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { campus } = useCampus();
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const fetchDepartments = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const deps = await getDepartments(campus?.$id, page);
      if (deps.documents.length === 0) {
        setHasMore(false);
      } else {
        setDepartments(prevDeps => [...prevDeps, ...deps.documents]);
        setPage(prevPage => prevPage + 1);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  }, [campus?.$id, page, loading, hasMore]);

  useEffect(() => {
    fetchDepartments();
  }, [campus?.$id]);

  const handleScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const paddingToBottom = 20;
    if (layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom) {
      fetchDepartments();
    }
  };

  const htmlStyles = {
    body: { 
      fontSize: 14, 
      color: theme?.color?.val,
      opacity: 0.8,
    },
  };

  return (
    <ScrollView onScroll={handleScroll} scrollEventThrottle={400}>
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
            {departments.map((department, index) => (
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
        {loading && (
          <YStack alignItems="center" paddingVertical="$4">
            <Spinner size="large" color={theme?.color?.val} />
          </YStack>
        )}
        {!hasMore && (
          <Text textAlign="center" paddingVertical="$4">No more departments to load</Text>
        )}
      </MyStack>
    </ScrollView>
  );
}