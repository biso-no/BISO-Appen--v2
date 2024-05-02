import { Card, Image, H6, Paragraph, YStack, XStack, View, SizableText, Button } from "tamagui";
import { getEvents } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import type { Models } from "appwrite";

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
        return str.charAt(0).toUpperCase() + str.slice(1);
      };

      const useEventImageUri = (imageId: string) => {
        return `https://appwrite-a0w8s4o.biso.no/v1/storage/buckets/events/files/${imageId}/view?project=biso`
      }

      //Display in a grid of 2 columns. One card for each event

    return (
        <YStack space="$4" justifyContent="center" alignItems="center">
            <XStack justifyContent="space-between" alignItems="center">
            <H6>Events</H6>
            <Button>See all</Button>
            </XStack>
            <XStack space="$3">
                {events.documents.map((event) => (
                    <Card
                        key={event.$id}
                        backgroundColor="$backgroundHover"
                        bordered
                        width={180}
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
                            <Paragraph>{event.created_at}</Paragraph>
                            </XStack>
                            <H6>{event.title}</H6>
                            {event.price > 0 &&<Paragraph>{event.price} kr</Paragraph>}
                        </YStack>
                        </Card.Footer>
                    </Card>
                ))}
            </XStack>
        </YStack>
    );
}