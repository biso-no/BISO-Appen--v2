//A list of news, instagram style
import { Card, Image, H6, Paragraph, YStack, XStack, ScrollView, YGroup, Button, H5, Text } from "tamagui";
import { useState } from "react";
import { useEffect } from "react";
import { getNews } from "@/lib/appwrite";
import { useRouter } from "expo-router";
import { capitalizeFirstLetter, truncateString } from "@/lib/utils/helpers";
import { getFormattedDateFromString } from "@/lib/format-time";
import { Models } from "react-native-appwrite";
import { MyStack } from "@/components/ui/MyStack";
import { Frown } from "@tamagui/lucide-icons";
import { useCampus } from "@/lib/hooks/useCampus";

export default function NewsScreen() {
    const [news, setNews] = useState<Models.DocumentList<Models.Document>>();
    const router = useRouter();
    const { campus } = useCampus();

    useEffect(() => {
        getNews(campus?.$id).then(
            (data) => setNews(data),
            (error) => console.log(error)
        );
    }, []);

    if (!news || news.total === 0) {
        return (
            <MyStack justifyContent="center" alignItems="center" space="$2">
                <Frown size={48} />
                <H6>No news available</H6>
            </MyStack>
        );
    }

    return (
        <ScrollView space="$4" padding="$3">
            <YGroup space="$4">
                {news?.documents.map((news, index) => (
                    <Card
                        key={index}
                        bordered
                        width={400}
                        onPress={() => window.open(news.url)}
                    >
                        <Card.Header>
                            <Image
                                source={{ uri: news.image }}
                                alt="image"
                                height={120}
                                borderRadius="$2"
                            />
                        </Card.Header>
                        <Card.Footer>
                            <YStack space="$1">
                                <XStack justifyContent="space-between">
                                    <Paragraph>{capitalizeFirstLetter(news.campus.name)}</Paragraph>
                                    <Paragraph>{getFormattedDateFromString(news.$createdAt)}</Paragraph>
                                </XStack>
                                <H6>{news.title}</H6>
                                <Paragraph>{truncateString(news.content, 100)}</Paragraph>
                            </YStack>
                        </Card.Footer>
                    </Card>
                ))}
            </YGroup>
        </ScrollView>
    );
}