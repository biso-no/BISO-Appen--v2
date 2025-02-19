import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { MotiView } from 'moti';
import RenderHTML from "react-native-render-html";
import { useWindowDimensions } from "react-native";
import { 
    Text, 
    YStack, 
    XStack,
    useTheme, 
    Card, 
    Spinner,
    H2,
    Paragraph,
    Button,
    styled,
    AnimatePresence,
    Theme,
} from "tamagui";
import { 
    Briefcase, 
    ChevronRight,
    Clock,
    Building2,
    HandHeart 
} from "@tamagui/lucide-icons";
import { useCampus } from "@/lib/hooks/useCampus";
import { Models } from "react-native-appwrite";
import { LinearGradient } from "@tamagui/linear-gradient";

// Styled components with theme tokens
const JobCard = styled(Card, {
    borderRadius: "$4",
    backgroundColor: "$background",
    elevate: true,
    
    variants: {
        compact: {
            true: {
                width: 300,
            },
            false: {
                width: 380,
            }
        }
    } as const,
})

const StatusBadge = styled(XStack, {
    backgroundColor: "$color4",
    borderRadius: "$10",
    paddingHorizontal: "$3",
    paddingVertical: "$1",
    alignItems: "center",
    gap: "$1",
})

const LocationBadge = styled(XStack, {
    backgroundColor: "$color2",
    borderRadius: "$10",
    paddingHorizontal: "$3",
    paddingVertical: "$1",
    alignItems: "center",
    gap: "$1",
})

export default function VolunteerList({ limit = 10, screen }: { limit?: number, screen?: boolean }) {
    const { width } = useWindowDimensions();
    const [jobs, setJobs] = useState<Models.Document[]>([]);
    const theme = useTheme();
    const { campus } = useCampus();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const htmlStyles = {
        body: { 
            fontSize: 16, 
            lineHeight: 24, 
            color: theme.color.get(),
            margin: 0,
            padding: 0,
        },
    };

    useEffect(() => {
        axios.get(`https://biso.no/wp-json/custom/v1/jobs/?includeExpired=true&per_page=${limit}&campus=${campus?.name}`)
            .then((response) => {
                setJobs(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching jobs:", error);
                setLoading(false);
            });
    }, [campus]);

    if (loading) {
        return (
            <YStack flex={1} justifyContent="center" alignItems="center" gap="$2">
                <Spinner size="large" color="$color9" />
                <Text color="$color11">Loading opportunities...</Text>
            </YStack>
        );
    }

    if (jobs.length === 0) {
        return (
            <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 500 }}
            >
                <YStack 
                    justifyContent="center" 
                    alignItems="center" 
                    gap="$4"
                    padding="$8"
                >
                    <HandHeart size={48} color={theme.color8.get()} />
                    <H2 color="$color11" textAlign="center">No positions available</H2>
                    <Paragraph color="$color9" textAlign="center">
                        Check back later for new opportunities at {campus?.name}
                    </Paragraph>
                    <Button
                        size="$4"
                        themeInverse
                        icon={ChevronRight}
                        onPress={() => router.push('/explore')}
                        animation="bouncy"
                        pressStyle={{ scale: 0.97 }}
                    >
                        Explore Other Options
                    </Button>
                </YStack>
            </MotiView>
        );
    }

    return (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
        >
            <YStack gap="$4" padding="$4">
                {screen && (
                    <YStack gap="$2">
                        <H2 
                            animation="lazy"
                            enterStyle={{ opacity: 0, scale: 0.9 }}
                            exitStyle={{ opacity: 0, scale: 0.9 }}
                            color="$color12"
                        >
                            Available Positions
                        </H2>
                        <Paragraph color="$color11">
                            Explore volunteer opportunities at {campus?.name}
                        </Paragraph>
                    </YStack>
                )}

                <AnimatePresence>
                    <YStack gap="$4">
                        {jobs.map((job, index) => (
                            <JobCard
                                key={job.id}
                                elevation={2}
                                animation="lazy"
                                pressStyle={{ scale: 0.98 }}
                                onPress={() => router.push(`/explore/volunteer/${job.id}`)}
                                compact={width < 380}
                                borderRadius="$4"
                            >
                                <LinearGradient
                                    colors={[theme.color4.get(), 'transparent']}
                                    start={[0, 0]}
                                    end={[1, 0]}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: 4,
                                        height: '100%',
                                        borderTopLeftRadius: 8,
                                        borderBottomLeftRadius: 8,
                                    }}
                                />
                                
                                <Card.Header padding="$3" gap="$2">
                                    <YStack gap="$3">
                                        <XStack justifyContent="space-between" alignItems="center">
                                            <StatusBadge>
                                                <Briefcase 
                                                    size={14} 
                                                    color={theme.color11.get()} 
                                                />
                                                <Text 
                                                    color="$color11" 
                                                    fontSize="$2" 
                                                    fontWeight="600"
                                                >
                                                    Volunteer
                                                </Text>
                                            </StatusBadge>
                                            
                                            <LocationBadge>
                                                <Building2 
                                                    size={14} 
                                                    color={theme.color11.get()} 
                                                />
                                                <Text 
                                                    color="$color11" 
                                                    fontSize="$2"
                                                >
                                                    {campus?.name}
                                                </Text>
                                            </LocationBadge>
                                        </XStack>

                                        <XStack gap="$2" alignItems="center">
                                            <RenderHTML
                                                source={{ html: job.title }}
                                                contentWidth={width - 100}
                                                tagsStyles={htmlStyles}
                                            />
                                        </XStack>
                                    </YStack>
                                </Card.Header>

                                <Card.Footer 
                                    padding="$3"
                                    paddingTop={0}
                                    borderTopWidth={1}
                                    borderTopColor="$borderColor"
                                >
                                    <XStack justifyContent="space-between" alignItems="center">
                                        <XStack gap="$2" alignItems="center">
                                            <Clock 
                                                size={14} 
                                                color={theme.color11.get()} 
                                            />
                                            <Text 
                                                fontSize="$2" 
                                                color="$color11"
                                            >
                                                Click to view details
                                            </Text>
                                        </XStack>
                                        <ChevronRight 
                                            size={16} 
                                            color={theme.color11.get()} 
                                        />
                                    </XStack>
                                </Card.Footer>
                            </JobCard>
                        ))}
                    </YStack>
                </AnimatePresence>
            </YStack>
        </MotiView>
    );
}