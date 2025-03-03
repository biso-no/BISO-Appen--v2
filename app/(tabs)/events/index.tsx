import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { MotiView } from 'moti';
import { getDocument } from "@/lib/appwrite";
import { YStack, H6, Paragraph, XStack, Card, Text, View, Image, ScrollView } from "tamagui";
import { capitalizeFirstLetter } from "@/lib/utils/helpers";
import { getFormattedDateFromString } from "@/lib/format-time";
import { Models } from "react-native-appwrite";
import RenderHTML from "react-native-render-html";
import { useWindowDimensions } from "react-native";



export default function EventsScreen() {
    const params = useLocalSearchParams();

    const { width } = useWindowDimensions();

    const { id } = params;

    const [event, setEvent] = useState<Models.Document>();  

    useEffect(() => {
        getDocument('event', id as string).then(
            (data) => setEvent(data),
            (error) => console.log(error)
        );
    }, [id])

    if (!event?.$id) {
        return (
            <View>
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <Text>Event not found</Text>
                </MotiView> 
            </View>
        )
    }
    
    return (
        <ScrollView>
            <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <Card
                    chromeless
                    width={400}
                    margin="$4"
                    borderRadius="$10"
                    
                >
                    <Card.Header>
                        <Image
                            source={{ uri: event.image}}
                            alt="image"
                            height={200}
                            width="100%"
                            borderRadius="$10"
                        />
                    </Card.Header>
                    <Card.Footer>
                        <YStack gap="$1">
                            <H6>{event.title}</H6>
                            <XStack justifyContent="space-between"> 
                                <Paragraph>{capitalizeFirstLetter(event.campus.name)}</Paragraph>
                                <Paragraph>{getFormattedDateFromString(event.start_date)}</Paragraph>
                            </XStack>
                        </YStack>
                    </Card.Footer>
                </Card>
                {event.description && (
                    <YStack gap="$3">
                        <H6>Description</H6>
                        <RenderHTML
                            source={{
                                html: event.description,
                            }}
                            contentWidth={width - 40}
                            />
                    </YStack>
                )}
            </MotiView>
        </ScrollView>
    );
}   