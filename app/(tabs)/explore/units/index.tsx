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

  const searchDepartments = useCallback(async (search: string) => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (!search) {
        fetchDepartments();
        return;
      }
      const deps = await databases.listDocuments('app', 'departments', [
        Query.search('Name', search),
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
  }, [loading]);


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

  useEffect(() => {
    setPage(1);
    setDepartments([]);
    setHasMore(true);
    fetchDepartments();
  }, [campus?.$id]);

  const htmlStyles = {
    body: { 
      fontSize: 14, 
      color: theme?.color?.val,
      opacity: 0.8,
    },
  };

  const renderItem = ({ item, index }: { item: Models.Document, index: number }) => (
    <MotiView
      key={item.$id}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500, delay: index * 100 }}
    >
      <Card
        elevate
        bordered
        animation="bouncy"
        scale={0.95}
        marginBottom="$4"
        hoverStyle={{ scale: 0.98 }}
        pressStyle={{ scale: 0.95 }}
        onPress={() => router.push(`/explore/units/${item.$id}`)}
      >
        <Card.Header padded>
          <XStack space="$3" alignItems="center" justifyContent="space-between" width="100%">
            <XStack space="$3" alignItems="center" flex={1}>
              {item.logo && (
              <Image
                source={{ uri: item.logo }}
                alt={`${item.Name} icon`}
                width={50}
                height={50}
                borderRadius="$2"
              />
              )}
              <YStack flex={1} space="$1">
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
  );

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

  const onEndReached = debounce(() => {
    if (!loading && hasMore) {
      fetchDepartments();
    }
  }, 300);

  return (
      <MyStack space="$4" padding="$4">
        <YStack space="$2">
          <Paragraph>Explore the various departments at {campus?.name}</Paragraph>

          {/* Search Input with onSubmitEditing */}
          <Input
            placeholder="Search for a department"
            backgroundColor={"transparent"}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            marginBottom="$4"
            onSubmitEditing={async () => {
              console.log('Submitting search');
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
      />
            </MyStack>
  );
}
