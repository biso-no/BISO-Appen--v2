import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Button, Card, View, Image, H6, Paragraph, YStack, XStack, Text } from "tamagui";
import { MotiView } from 'moti';
import { getDocument, getNews } from "@/lib/appwrite";
import { useRouter } from "expo-router";
import { capitalizeFirstLetter, truncateString } from "@/lib/utils/helpers";
import { getFormattedDateFromString } from "@/lib/format-time";
import { Models } from "react-native-appwrite";
import { MyStack } from "@/components/ui/MyStack";
import { RenderHTML } from 'react-native-render-html';
import { useWindowDimensions } from "react-native";

export default function NewsScreen() {
    const params = useLocalSearchParams();

    const { id } = params;

    const [post, setPost] = useState<Models.Document>();
    const router = useRouter();

    const { width } = useWindowDimensions();

    useEffect(() => {
        getDocument('news', id as string).then(
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

  const style = { 
    body: { 
      fontSize: 16, 
      lineHeight: 24, 
      color: '$color', 
    }, 
  };

    return (
        <View>
            <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <Card
                    chromeless
                    width={400}
                >
                    <Card.Header>
                        <Image
                            source={{ uri: post.image}}
                            alt="image"
                            height={200}
                            width="100%"
                            borderRadius="$10"
                        />
                    </Card.Header>
                    <Card.Footer justifyContent="center">
                        <YStack space="$1">
                        <H6>{post.title}</H6>
                            <XStack justifyContent="space-between"> 
                            <Paragraph>{capitalizeFirstLetter(post.campus.name)}</Paragraph>
                            <Paragraph>{getFormattedDateFromString(post.$createdAt)}</Paragraph>
                            </XStack>
                            <RenderHTML 
                            source={{ html: post.content }} 
                            contentWidth={width - 40} 
                            tagsStyles={style}
                            />
                        </YStack>
                    </Card.Footer>
                </Card>
            </MotiView>
        </View>
    );
}