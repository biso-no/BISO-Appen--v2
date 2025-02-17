//A list of news, instagram style
import { Card, Image, H6, Paragraph, YStack, XStack, ScrollView, YGroup, Button, H5, Text, H3, Separator } from "tamagui";
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
import RenderHTML from "react-native-render-html";

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
            <MyStack justifyContent="center" alignItems="center" gap="$2">
                <Frown size={48} />
                <H6>No news available</H6>
            </MyStack>
        );
    }

    //A variable that will be used to ensure the separator is not displayed on the last item
    const hasSeparator = news?.documents.length > 1;

    return (
        <ScrollView gap="$4" padding="$3">
            <YGroup gap="$4">
                {news?.documents.map((news, index) => (
                    <YStack key={index} gap="$4">
                    <Card
                        key={index}
                        chromeless
                        onPress={() => router.push(`/explore/news/${news.$id}`)}
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
                            <YStack gap="$1">
                                <XStack justifyContent="space-between">
                                    <Paragraph>{capitalizeFirstLetter(news.campus.name)}</Paragraph>
                                    <Paragraph>{getFormattedDateFromString(news.$createdAt)}</Paragraph>
                                </XStack>
                                <H3>{news.title}</H3>
                            </YStack>
                        </Card.Footer>
                    </Card>
                    {hasSeparator && <Separator />}
                    </YStack>
                ))}
            </YGroup>
        </ScrollView>
    );
}