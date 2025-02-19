import { Card, Image, H6, Paragraph, YStack, XStack, View, SizableText, Button } from "tamagui";
import { databases, getEvents } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import { Query, type Models } from "react-native-appwrite";
import { formatDate, getFormattedDateFromString } from "@/lib/format-time";
import { Frown } from "@tamagui/lucide-icons";
import { MyStack } from "../ui/MyStack";
import { getEvents as getWebsiteEvents, Event } from "@/lib/get-events";
import { useCampus } from "@/lib/hooks/useCampus";
import { useRouter } from "expo-router";
import { useWindowDimensions } from "react-native";
import { mapCampus } from "@/lib/utils/map-campus";
export function Events() {
    const { width } = useWindowDimensions();

    const [events, setEvents] = useState<Models.Document[]>();

    const router = useRouter();

    const { campus } = useCampus();

    useEffect(() => {
        async function fetchEvents() {

            let query = [
                //Select only the values used in the UI
                Query.select(['title', 'short_description', 'image', 'event_date', '$id', 'campus_id', 'url', 'description']),
                Query.limit(25),
            ];

            if (campus?.$id) {
                query.push(Query.equal('campus_id', [campus.$id, '5']));
            }

            const fetchedEvents = await databases.listDocuments('app', 'event', query);
            setEvents(fetchedEvents.documents);
            console.log(fetchedEvents);
        }
        fetchEvents();
    }, [campus]);


    const capitalizeFirstLetter = (str: string) => {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    };

    const useEventImageUri = (imageId: string) => {
        return process.env.EXPO_PUBLIC_APPWRITE_URI + `storage/buckets/event/files/${imageId}/view?project=665313680028cb624457`
    }

    if (!events || events.length === 0) {
        return (
            <MyStack justifyContent="center" alignItems="center" gap="$2" backgroundColor={"transparent"}>
              <H6>Stay tuned!</H6>
            </MyStack>
          );
        }
        

    return (
        <YStack gap="$4" justifyContent="center" alignItems="center">
            <XStack justifyContent="space-between" alignItems="center">
            <Button>See all</Button>
            </XStack>
            <XStack gap="$3" flexWrap="wrap" justifyContent="center" alignItems="center">
                {events.map((event) => (
                <Card
                key={event.id}
                chromeless
                width={width < 375 ? 300 : 380}
                        onPress={() => router.push(`/explore/events/${event.$id}`)}
                    >
                        <Card.Header>
                            {event.image ? (
                            <Image
                                source={{ uri: event.image }}
                                alt="image"
                                height={120}
                                borderRadius="$2"
                            />
                            ) : (
                                <Image
                                    source={{ uri: require('@/assets/logo-dark.png') }}
                                    alt="image"
                                    height={120}
                                    borderRadius="$2"
                                />
                            )}
                        </Card.Header>
                        <Card.Footer>
                        <YStack gap="$1">
                            <XStack justifyContent="space-between">
                            <Paragraph>{capitalizeFirstLetter(mapCampus(event.campus_id))}</Paragraph>

                            </XStack>
                            <H6>{event.title}</H6>
                            <XStack gap="$2" alignItems="center" justifyContent="space-between">
                            </XStack>
                        </YStack>
                        </Card.Footer>
                    </Card>
                ))}
            </XStack>
        </YStack>
    );
}
