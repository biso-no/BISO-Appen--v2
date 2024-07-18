import { Card, Image, H6, Paragraph, YStack, XStack, View, SizableText, Button } from "tamagui";
import { getEvents } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import type { Models } from "react-native-appwrite";
import { getFormattedDateFromString } from "@/lib/format-time";
import { Frown } from "@tamagui/lucide-icons";
import { MyStack } from "../ui/MyStack";
import { getEvents as getWebsiteEvents, Event } from "@/lib/get-events";
import { useCampus } from "@/lib/hooks/useCampus";

export function Events() {

    const [events, setEvents] = useState<Event[]>();

    const { campus } = useCampus();

    useEffect(() => {
        async function fetchEvents() {
            const fetchedEvents = await getWebsiteEvents(campus);
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

    if (!events || events.length === 0) {
        return (
            <MyStack justifyContent="center" alignItems="center" space="$2">
              <Frown size={48} />
              <H6>No events found</H6>
            </MyStack>
          );
        }

    return (
        <YStack space="$4" justifyContent="center" alignItems="center">
            <XStack justifyContent="space-between" alignItems="center">
            <Button>See all</Button>
            </XStack>
            <XStack space="$3" flexWrap="wrap" justifyContent="center" alignItems="center">
                {events.map((event) => (
                    <Card
                        key={event.id}
                        backgroundColor="$backgroundHover"
                        bordered
                        width={380}
                    >
                        <Card.Header>
                            <Image
                                source={{ uri: useEventImageUri(event.image) }}
                                alt="image"
                                height={120}
                                borderRadius="$2"
                            />
                        </Card.Header>
                        <Card.Footer>
                        <YStack space="$1">
                            <XStack justifyContent="space-between">
                            <Paragraph>{capitalizeFirstLetter(event.organizer[0].organizer)}</Paragraph>

                            </XStack>
                            <H6>{event.title}</H6>
                            <XStack space="$2" alignItems="center" justifyContent="space-between">
                            <Paragraph>{getFormattedDateFromString(event.start_date)}</Paragraph>
                            </XStack>
                        </YStack>
                        </Card.Footer>
                    </Card>
                ))}
            </XStack>
        </YStack>
    );
}
