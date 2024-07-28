import { Card, Image, H6, Paragraph, YStack, XStack, Separator } from "tamagui";
import { getNews } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import type { Models } from "react-native-appwrite";
import { getFormattedDateFromString } from "@/lib/format-time";
import { Frown } from "@tamagui/lucide-icons";
import { MyStack } from "../ui/MyStack";
import { RenderHTML } from 'react-native-render-html';
import { useRouter } from "expo-router";

export function News() {

    const [news, setNews] = useState<Models.DocumentList<Models.Document>>({ documents: [], total: 0 });

    const router = useRouter();

    useEffect(() => {
        async function fetchNews() {
            const fetchedNews = await getNews();
            setNews(fetchedNews);
            console.log(fetchedNews);
        }
        fetchNews();
    }, []);

    const truncateDescription = (description: string | undefined, maxLength: number) => {
        if (description && description.length > maxLength) {
            return description.substring(0, maxLength) + "...";
        }
        return description || "";
    };
    

    const capitalizeFirstLetter = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
      };

      if (!news || news.total === 0) {
        return (
          <MyStack justifyContent="center" alignItems="center" space="$2">
            <Frown size={48} />
            <H6>No news available</H6>
          </MyStack>
        );
      }

    return (
        <YStack justifyContent="center" alignItems="center" space="$2">
            {news?.documents.map((news, index) => (
                <>
                <Card
                    key={index}
                    chromeless
                    width={400}
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
                            <Paragraph>{capitalizeFirstLetter(news.campus.name)}</Paragraph>
                            <Paragraph>{getFormattedDateFromString(news.$createdAt)}</Paragraph>
                            </XStack>
                        </YStack>
                    </Card.Footer>
                </Card>
                <Separator key={'sep' + index} />
                </>
            ))}
        </YStack>
    );
}
