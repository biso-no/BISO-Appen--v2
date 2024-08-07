import { Card, Image, H6, Paragraph, YStack, XStack, Separator, Button } from "tamagui";
import { databases, getNews } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import { Query, type Models } from "react-native-appwrite";
import { getFormattedDateFromString } from "@/lib/format-time";
import { Frown } from "@tamagui/lucide-icons";
import { MyStack } from "../ui/MyStack";
import { RenderHTML } from 'react-native-render-html';
import { useRouter } from "expo-router";
import { useCampus } from "@/lib/hooks/useCampus";
import { View } from "react-native";
import { useWindowDimensions } from "react-native";
export function News() {

    const { width } = useWindowDimensions();

    const [news, setNews] = useState<Models.DocumentList<Models.Document>>({ documents: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const { campus } = useCampus();
    const router = useRouter();

    useEffect(() => {
        async function fetchNews() {

            let query = [
                //Select only the values used in the UI
                Query.select(['title', 'content', 'image', 'campus_id', 'department_id', '$createdAt', '$id']),
            ];

            if (campus?.$id) {
                query.push(Query.equal('campus_id', campus.$id));
            }

            const fetchedNews = await databases.listDocuments('app', 'news', query);

            setNews(fetchedNews);
            console.log("Fetched news: ", fetchedNews);
        }
        fetchNews();
        setLoading(false);
    }, [campus]);

    const truncateDescription = (description: string | undefined, maxLength: number) => {
        if (description && description.length > maxLength) {
            return description.substring(0, maxLength) + "...";
        }
        return description || "";
    };
    

    const capitalizeFirstLetter = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
      };

      if (!news || news.total === 0 || loading) {
        return (
          <MyStack justifyContent="center" alignItems="center" space="$2">
            <Frown size={48} />
            <H6>No news available</H6>
          </MyStack>
        );
      }

    return (
        <YStack justifyContent="center" alignItems="center" space="$2">
            <Button bordered transparent onPress={() => router.push("/explore/news")}>See all</Button>
            {news?.documents.map((news, index) => (
                <View key={index}>
                <Card
                    key={index}
                    chromeless
                    width={width < 375 ? 300 : 380}
                    onPress={() => router.push(`/explore/news/${news.$id}`)}
                >
                    <Card.Header>
                        <Image
                            source={{ uri: news.image}}
                            alt="image"
                            height={200}
                            width="100%"
                            borderRadius="$10"
                        />
                    </Card.Header>
                    <Card.Footer>
                        <YStack space="$1">
                        <H6>{news.title}</H6>
                            <XStack justifyContent="space-between"> 
                            
                            <Paragraph>{getFormattedDateFromString(news.$createdAt)}</Paragraph>
                            </XStack>
                        </YStack>
                    </Card.Footer>
                </Card>
                <Separator key={'sep' + index} />
                </View>
            ))}
        </YStack>
    );
}
