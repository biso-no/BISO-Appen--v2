import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Card, View, Image, H6, Paragraph, YStack, XStack, Text, ScrollView } from "tamagui";
import { MotiView } from 'moti';
import { databases, getDocument, getNews } from "@/lib/appwrite";
import { useRouter } from "expo-router";
import { capitalizeFirstLetter, truncateString } from "@/lib/utils/helpers";
import { getFormattedDateFromString } from "@/lib/format-time";
import { Models, Query } from "react-native-appwrite";
import { MyStack } from "@/components/ui/MyStack";
import { RenderHTML } from 'react-native-render-html';
import { useWindowDimensions } from "react-native";
import { useCampus } from "@/lib/hooks/useCampus";
import { useTheme } from "tamagui";

export default function NewsScreen() {
    const params = useLocalSearchParams();

    const { id } = params;
    const { campus, availableCampuses } = useCampus();

    const [post, setPost] = useState<Models.Document>();
    const router = useRouter();
    const theme = useTheme();
    const textColor = theme?.color?.val;
    const { width } = useWindowDimensions();

    useEffect(() => {
        databases.getDocument('app', 'news', id as string, [
            Query.select(['title', 'content', 'image', 'campus_id', 'department_id', '$createdAt', '$id', 'url']),
        ]).then(
            (data) => setPost(data),
            (error) => console.log(error)
        );
    }, [id])

    if (!post?.$id) {
        return (
            <View>
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <Text>Post not found</Text>
                </MotiView>
            </View> 
        )
    }
    

    const getCampusName = (campusId: string) => {
        const campus = availableCampuses.find(campus => campus.id === campusId);
        return campus ? campus.name : 'Unknown Campus';
    };

  const style = { 
    body: { 
      fontSize: 16, 
      lineHeight: 24, 
      color: textColor, 
    }, 
  };

    return (
        <ScrollView>
        <YStack space="$4" padding="$4">
            <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                        <Image
                            source={{ uri: post.image}}
                            alt="image"
                            height={200}
                            width="100%"
                            borderRadius="$10"
                        />
                        <YStack space="$1">
                        <H6>{post.title}</H6>
                            <XStack justifyContent="space-between"> 
                            <Paragraph>{capitalizeFirstLetter(getCampusName(post.campus_id))}</Paragraph>
                            <Paragraph>{getFormattedDateFromString(post.$createdAt)}</Paragraph>
                            </XStack>
                            <RenderHTML 
                            source={{ html: post.content }} 
                            contentWidth={width - 40} 
                            tagsStyles={style}
                            />
                            {post.url && (
                            <Button onPress={() => window.open(post.url)}>View on BISO.no</Button>
                            )}
                        </YStack>
            </MotiView>
        </YStack>
        </ScrollView>
    );
}