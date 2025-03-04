import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { MotiView } from 'moti';
import { getDocument } from "@/lib/appwrite";
import { YStack, H6, Paragraph, XStack, Card, Separator, Button, Text, View, Image, ScrollView, useTheme } from "tamagui";
import { capitalizeFirstLetter } from "@/lib/utils/helpers";
import { getFormattedDate } from "@/lib/format-time";
import { Models } from "react-native-appwrite";
import { MyStack } from "@/components/ui/MyStack";
import RenderHTML from "react-native-render-html";



export default function EventsScreen() {
    const params = useLocalSearchParams();

    const { id } = params;
    const router = useRouter();
    const theme = useTheme();
    const textColor = theme?.color?.val;
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

    const htmlStyles = {
        body: { 
          fontSize: 16, 
          lineHeight: 24, 
          color: textColor,
        },    
      };
    
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
                    {event.image && (
                    <Card.Header>
                        <Image
                            source={{ uri: event.image}}
                            alt="image"
                            height={200}
                            width="100%"
                            borderRadius="$10"
                        />
                    </Card.Header>
                    )}
                    <Card.Footer>
                        <YStack gap="$1">
                            <H6>{event.title}</H6>
                            <XStack justifyContent="space-between"> 
                                <Paragraph>{capitalizeFirstLetter(event.campus.name)} </Paragraph>
                                <Paragraph>{getFormattedDate(event.event_date)}</Paragraph>
                            </XStack>
                        </YStack>
                    </Card.Footer>
                </Card>
                {event.description && (
                    <MyStack gap="$3">
                        <H6>Description</H6>
                        <RenderHTML
                            source={{ html: event.description }}
                            contentWidth={400}
                            tagsStyles={htmlStyles}
                        />
                        {event.url && (
                        <Button onPress={() => router.push(event.url)}>View on BISO.no</Button>
                        )}
                    </MyStack>
                )}
            </MotiView>
        </ScrollView>
    );
}   