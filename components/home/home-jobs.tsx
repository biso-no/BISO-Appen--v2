import { Briefcase, ChevronRight } from "@tamagui/lucide-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { memo, useMemo } from "react";
import RenderHTML from "react-native-render-html";
import { YStack, XStack, H3, Card, Stack, Text, Button } from "tamagui";
import { useWindowDimensions, ColorSchemeName } from "react-native";
import { Job } from "@/types/jobs";
import { useTheme } from "tamagui";
import { useColorScheme } from "react-native";
import { useCampus } from "@/lib/hooks/useCampus";
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';

interface HomeJobsProps {
    jobs: Job[];
}

// Create a memoized JobCard component to optimize rendering
const JobCard = memo(({ job, width, theme, colorScheme, campusName }: { 
    job: Job; 
    width: number; 
    theme: any;
    colorScheme: ColorSchemeName;
    campusName: string | null;
}) => {
    const { t } = useTranslation();
    return (
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
                                {campusName || t('all-campuses')}
                            </Text>
                        </YStack>
                    </XStack>
                    
                    <XStack justifyContent="flex-end" alignItems="center">
                        <ChevronRight size={20} color="$gray11" />
                    </XStack>
                </YStack>
            </BlurView>
        </Card>
    );
});

JobCard.displayName = 'JobCard';

// Memoized component to prevent unnecessary re-renders
export const HomeJobs = memo(({ jobs }: HomeJobsProps) => {
    const theme = useTheme();
    const colorScheme = useColorScheme();
    const { width } = useWindowDimensions();
    const { campus } = useCampus();
    const { t } = useTranslation();
    // Memoize the job cards to prevent re-rendering when switching categories
    const jobCards = useMemo(() => {
        if (!jobs || jobs.length === 0) return null;
        
        return jobs.map(job => (
            <JobCard 
                key={`job-${job.id}`}
                job={job} 
                width={width} 
                theme={theme} 
                colorScheme={colorScheme}
                campusName={campus?.name}
            />
        ));
    }, [jobs, width, theme, colorScheme, campus?.name]);
    
    // Handle empty state
    if (!jobs || jobs.length === 0) {
        return (
            <YStack gap="$4" paddingHorizontal="$4">
                <XStack justifyContent="space-between" alignItems="center">
                    <H3>{t('volunteer-positions')}</H3>
                    <Button
                        chromeless
                        onPress={() => router.push('/explore/volunteer')}
                    >
                        <Text fontSize={14} color="$blue9">{t('see-all')}</Text>
                    </Button>
                </XStack>
                <Text color="$gray11" textAlign="center" padding="$4">
                    {t('no-volunteer-positions-available-at-the-moment')}
                </Text>
            </YStack>
        );
    }
    
    return (
        <YStack gap="$4" padding="$4">
            <XStack justifyContent="space-between" alignItems="center">
                <H3>{t('volunteer-positions-0')}</H3>
                <Button
                    chromeless
                    onPress={() => router.push('/explore/volunteer')}
                >
                    <Text fontSize={14} color="$blue9">{t('see-all-0')}</Text>
                </Button>
            </XStack>

            {jobCards}
        </YStack>
    );
});

HomeJobs.displayName = 'HomeJobs';