import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from "expo-router";
import { Models, Query } from "react-native-appwrite";
import RenderHTML from "react-native-render-html";
import { 
  YStack, 
  Card, 
  Paragraph, 
  Image, 
  XStack,
  H2,
  H3, 
  Text,
  useTheme,
  Spinner,
  Input,
} from "tamagui";
import { ChevronRight } from "@tamagui/lucide-icons";
import { MyStack } from "@/components/ui/MyStack";
import { databases, getDepartments } from "@/lib/appwrite";
import { useCampus } from "@/lib/hooks/useCampus";
import { MotiView } from 'moti';
import { useWindowDimensions, FlatList, ScrollView } from 'react-native';
import { debounce } from 'tamagui';
import { useDebounce } from 'use-debounce';

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
  const [search, setSearch] = useState('');
  const { campus } = useCampus();
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const memoizedDepartments = useMemo(() => departments, [departments]);

  const fetchDepartments = useCallback(async () => {
    if (loading || !hasMore || !campus?.$id) return;
    
    setLoading(true);
    try {
      const deps = await getDepartments(campus.$id, page);
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

  const searchDepartments = useCallback(async (searchTerm: string) => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (!searchTerm) {
        fetchDepartments();
        return;
      }
      const deps = await databases.listDocuments('app', 'departments', [
        Query.search('Name', searchTerm),
        Query.limit(20),
      ]);
      if (deps.documents.length === 0) {
        setHasMore(false);
      } else {
        setDepartments(deps.documents);
        setPage(1);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, fetchDepartments]);

  useEffect(() => {
    setPage(1);
    setDepartments([]);
    setHasMore(true);
    fetchDepartments();
  }, [campus?.$id]);

  const htmlStyles = useMemo(() => ({
    body: { 
      fontSize: 14, 
      color: theme?.color?.val,
      opacity: 0.8,
    },
  }), [theme?.color?.val]);

  const onEndReached = useCallback(
    debounce(() => {
      if (!loading && hasMore) {
        fetchDepartments();
      }
    }, 300),
    [loading, hasMore, fetchDepartments]
  );

  const renderItem = useCallback(({ item }: { item: Models.Document }) => (
    <MotiView
      key={item.$id}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500, delay: 0 }}
    >
      <Card
        animation="bouncy"
        scale={0.95}
        marginBottom="$4"
        hoverStyle={{ scale: 0.98 }}
        pressStyle={{ scale: 0.95 }}
        onPress={() => router.push(`/explore/units/${item.$id}`)}
      >
        <Card.Header padded>
          <XStack gap="$3" alignItems="center" justifyContent="space-between" width="100%">
            <XStack gap="$3" alignItems="center" flex={1}>
              {item.logo && (
              <Image
                source={{ uri: item.logo }}
                alt={`${item.Name} icon`}
                width={50}
                height={50}
                borderRadius="$2"
              />
              )}
              <YStack flex={1} gap="$1">
                <H3 numberOfLines={1} ellipsizeMode="tail">{item.Name}</H3>
                {item.description && (
                    <RenderHTML 
                      source={{ html: truncateHTML(item.description) }}
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
  ), [router, width, htmlStyles]);

  const renderFooter = () => {
    if (loading) {
      return (
        <YStack alignItems="center" paddingVertical="$4">
          <Spinner size="large" color={theme?.color?.val} />
        </YStack>
      );
    }

    if (!hasMore) {
      return <Text textAlign="center" paddingVertical="$4">Didn't find your unit? Reach out to management.</Text>;
    }

    return null;
  };

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 150,
    offset: 150 * index,
    index,
  }), []);

  return (
    <MyStack gap="$4" padding="$4">
      <YStack gap="$2">
        <Paragraph>Explore the various departments at {campus?.name}</Paragraph>

        <Input
          placeholder="Search for a department"
          backgroundColor={"transparent"}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          marginBottom="$4"
          onSubmitEditing={async () => {
            await searchDepartments(search);
          }}
        />
      </YStack>

      <FlatList
        data={memoizedDepartments}
        keyExtractor={item => item.$id}
        renderItem={renderItem}
        ListFooterComponent={renderFooter}
        onEndReached={onEndReached}
        keyboardShouldPersistTaps="handled"
        onEndReachedThreshold={0.5}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
      />
    </MyStack>
  );
}
