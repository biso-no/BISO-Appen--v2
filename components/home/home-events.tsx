import type { Event } from "@/types/event";
import { Calendar, MapPin } from "@tamagui/lucide-icons";
import { formatDate, parseISO } from "date-fns";
import { router } from "expo-router";
import React from "react";
import { LinearGradient } from "tamagui/linear-gradient";
import { YStack, XStack, H3, Image, Text, Button, Card, styled } from "tamagui";
import { MotiView } from "moti";
import { useWindowDimensions } from "react-native";
interface HomeEventsProps {
    activeCategory: string;
    events: Event[];
}

const EventCard = styled(Card, {
    borderRadius: 24,
    marginBottom: "$4",
    overflow: "hidden",
    variants: {
      featured: {
        true: {
          height: 400,
        },
        false: {
          height: 250,
        },
      },
    },
  })

export function HomeEvents({ activeCategory, events }: HomeEventsProps) {
    const { width } = useWindowDimensions();
    return (
        <MotiView
        key="events-section"
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <YStack gap="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <H3>Upcoming Events</H3>
            <Button
              chromeless
              onPress={() => router.push('/explore/events')}
            >
              <Text fontSize={14} color="$blue9">See all</Text>
            </Button>
          </XStack>

          {events.map((event, index) => (
            <EventCard
              key={`regular-event-${event.id}`}
              pressStyle={{ scale: 0.98 }}
              animation="lazy"
              onPress={() => router.push(`/explore/events/${event.id}`)}
              featured={index === 0}
            >
              <Image
                source={{ uri: event.featured_image }}
                alt={event.title}
                height={index === 0 ? 300 : 200}
                width={width - 32}
              />
              <LinearGradient
                start={[0, 0]}
                end={[0, 1]}
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: 16,
                }}
              >
                <YStack gap="$2">
                  <XStack gap="$2" alignItems="center">
                    <Calendar size={16} color="white" />
                    <Text color="white">
                      {formatDate(parseISO(event.date), 'dd MMM yyyy')}
                    </Text>
                  </XStack>
                  <H3 color="white">{event.title}</H3>
                  {event.venue && (
                    <XStack gap="$2" alignItems="center">
                      <MapPin size={16} color="white" />
                      <Text color="white">{event.venue}</Text>
                    </XStack>
                  )}
                </YStack>
              </LinearGradient>
            </EventCard>
          ))}
        </YStack>
      </MotiView>
    )
}