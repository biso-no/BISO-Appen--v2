import { Card, Image, H6, Paragraph, YStack, XStack, View, SizableText, Button } from "tamagui";
import { getEvents } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import type { Models } from "react-native-appwrite";
import { getFormattedDateFromString } from "@/lib/format-time";

export function Events() {

    const [events, setEvents] = useState<Models.DocumentList<Models.Document>>({ documents: [], total: 0 });

    useEffect(() => {
        async function fetchEvents() {
            const fetchedEvents = await getEvents();
            setEvents(fetchedEvents);
            console.log(fetchedEvents);
        }
        fetchEvents();
    }, []);

    const capitalizeFirstLetter = (str: string) => {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    };

    const useEventImageUri = (imageId: string) => {
        return process.env.EXPO_PUBLIC_APPWRITE_URI + `storage/buckets/event/files/${imageId}/view?project=665313680028cb624457`
    }

    //Display in a grid of 2 columns. One card for each event

    return (
        <YStack space="$4" justifyContent="center" alignItems="center">
            <XStack justifyContent="space-between" alignItems="center">
            <Button>See all</Button>
            </XStack>
            <XStack space="$3" flexWrap="wrap" justifyContent="center" alignItems="center">
                {events.documents.map((event) => (
                    <Card
                        key={event.$id}
                        backgroundColor="$backgroundHover"
                        bordered
                        width={380}
                    >
                        <Card.Header>
                            <Image
                                source={{ uri: useEventImageUri(event.image_id) }}
                                alt="image"
                                height={120}
                                borderRadius="$2"
                            />
                        </Card.Header>
                        <Card.Footer>
                        <YStack space="$1">
                            <XStack justifyContent="space-between">
                            <Paragraph>{capitalizeFirstLetter(event.campus)}</Paragraph>

                            </XStack>
                            <H6>{event.title}</H6>
                            <XStack space="$2" alignItems="center" justifyContent="space-between">
                            {event.price > 0 &&<Paragraph>{event.price} kr</Paragraph>}
                            <Paragraph>·</Paragraph>
                            <Paragraph>{getFormattedDateFromString(event.event_date)}</Paragraph>
                            </XStack>
                        </YStack>
                        </Card.Footer>
                    </Card>
                ))}
            </XStack>
        </YStack>
    );
}
