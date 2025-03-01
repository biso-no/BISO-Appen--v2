import { Briefcase, ChevronRight } from "@tamagui/lucide-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React from "react";
import RenderHTML from "react-native-render-html";
import { YStack, XStack, H3, Card, Stack, Text, Button, styled } from "tamagui";
import { MotiView } from "moti";
import { useWindowDimensions } from "react-native";
import { Job } from "@/types/jobs";
import { useTheme } from "tamagui";
import { useColorScheme } from "react-native";
import { useCampus } from "@/lib/hooks/useCampus";



interface HomeJobsProps {
    jobs: Job[];
    activeCategory: string;
}

export function HomeJobs({ jobs }: HomeJobsProps) {

    const theme = useTheme();
    const colorScheme = useColorScheme();
    const { width } = useWindowDimensions();
    const { campus } = useCampus();
    return (
        <MotiView
                key="jobs-section"
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <YStack gap="$4">
                  <XStack justifyContent="space-between" alignItems="center">
                    <H3>Volunteer Positions</H3>
                    <Button
                      chromeless
                      onPress={() => router.push('/explore/volunteer')}
                    >
                      <Text fontSize={14} color="$blue9">See all</Text>
                    </Button>
                  </XStack>

                  {jobs.map((job) => (
                    <MotiView
                      key={`job-${job.id}`}
                      from={{ opacity: 0, translateY: 20 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      <Card
                        pressStyle={{ scale: 0.98 }}
                        onPress={() => router.push(`/explore/volunteer/${job.id}`)}
                      >
                        <BlurView
                          intensity={80}
                          tint={colorScheme === 'dark' ? 'dark' : 'light'}
                          style={{
                            padding: 16,
                            borderRadius: 16,
                          }}
                        >
                          <YStack gap="$3">
                            <XStack gap="$3" alignItems="center">
                              <Stack
                                backgroundColor="$blue4"
                                padding="$2"
                                borderRadius="$4"
                              >
                                <Briefcase size={24} color="$blue11" />
                              </Stack>
                              <YStack flex={1}>
                                <Text
                                  fontSize={16}
                                  fontWeight="bold"
                                  numberOfLines={2}
                                >
                                  <RenderHTML
                                    source={{ html: job.title }}
                                    contentWidth={width - 120}
                                    tagsStyles={{
                                      body: {
                                        color: theme?.color?.get(),
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                      },
                                    }}
                                  />
                                </Text>
                                <Text fontSize={14} color="$gray11">
                                  {campus?.name || 'All Campuses'}
                                </Text>
                              </YStack>
                            </XStack>
                            
                            <XStack justifyContent="flex-end" alignItems="center">
                              <ChevronRight size={20} color="$gray11" />
                            </XStack>
                          </YStack>
                        </BlurView>
                      </Card>
                    </MotiView>
                  ))}
                </YStack>
              </MotiView>
    )
}