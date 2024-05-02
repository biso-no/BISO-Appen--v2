import { Card, Image, H6, Paragraph, YStack, XStack } from "tamagui";
import { getNews } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import type { Models } from "appwrite";

export function News() {

    const [news, setNews] = useState<Models.DocumentList<Models.Document>>({ documents: [], total: 0 });

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

      const useNewsImageUri = (imageId: string) => {
        return `https://appwrite-a0w8s4o.biso.no/v1/storage/buckets/6633a94e0038cfed7b1d/files/${imageId}/view?project=biso`
      }


    return (
        <YStack justifyContent="center" alignItems="center" space="$2">
            {news?.documents.map((news, index) => (
                <Card
                    key={index}
                    bordered
                    width={400}
                    onPress={() => window.open(news.url)}
                >
                    <Card.Header>
                        <Image
                            source={{ uri: useNewsImageUri(news.image) }}
                            alt="image"
                            height={200}
                            width="100%"
                            borderRadius="$10"
                        />
                    </Card.Header>
                    <Card.Footer>
                        <YStack space="$1">
                            <XStack justifyContent="space-between">
                            <Paragraph>{capitalizeFirstLetter(news.campus)}</Paragraph>
                            <Paragraph>{news.created_at}</Paragraph>
                            </XStack>
                            <H6>{news.title}</H6>
                            <Paragraph>{truncateDescription(news.content, 100)}</Paragraph>
                        </YStack>
                    </Card.Footer>
                </Card>
            ))}
        </YStack>
    );
}
