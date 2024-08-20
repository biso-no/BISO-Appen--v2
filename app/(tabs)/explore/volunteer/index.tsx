import RenderHTML from "react-native-render-html";
import axios from "axios";
import { useEffect, useState } from "react";
import { Text, YStack, useTheme, Card, Separator, ScrollView, Button, Spinner } from "tamagui";
import { useCampus } from "@/lib/hooks/useCampus";
import { useRouter } from "expo-router";
import { Image } from 'react-native';
import { MotiView } from 'moti';

export default function VolunteerScreen() {

    const [jobs, setJobs] = useState<{ id: number, title: string, content: string }[]>([]);
    const theme = useTheme();
    const { campus } = useCampus();
    const textColor = theme?.color?.val;
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const htmlStyles = {
        body: { 
            fontSize: 16, 
            lineHeight: 24, 
            color: textColor,
        }, 
    };

    const titleStyles = {
        body: { 
            fontSize: 20, 
            lineHeight: 32, 
            color: textColor,
        },
    };

    useEffect(() => {
        axios.get('https://biso.no/wp-json/custom/v1/jobs/?includeExpired=true&per_page=10&campus=' + campus?.name)
            .then((response) => {
                console.log("Response:", response);
                setJobs(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching jobs:", error);
                setLoading(false);
            });
    }, []);
    
    if (loading) {
        return (
            <YStack flex={1} justifyContent="center" alignItems="center">
                <Spinner size="large" />
            </YStack>
        );
    }

    return (
        <ScrollView>
            <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
            <YStack space="$4" padding="$4" alignItems="center" justifyContent="center">
                {jobs.length > 0 ? (
                    jobs.map((job, index) => (
                        <YStack key={index} space="$4">
                            <Card padding="$4" chromeless onPress={() => router.push(`/explore/volunteer/${job.id}`)}>
                                <RenderHTML
                                    source={{ html: job.title }}
                                    contentWidth={400}
                                    key={index}
                                    tagsStyles={titleStyles}
                                />
                            </Card>
                            <Separator />
                        </YStack>
                    ))
                ) : (
                    <YStack alignItems="center" space="$4" padding="$4">
                        <Image
                            source={{ uri: 'https://path-to-your-placeholder-image.png' }}
                            style={{ width: 200, height: 200 }}
                        />
                        <Text fontSize={24} color={textColor} textAlign="center">
                            No jobs available at the moment
                        </Text>
                        <Text fontSize={16} color={textColor} textAlign="center" padding="$2">
                            Please check back later.
                        </Text>
                    </YStack>
                )}
            </YStack>
            </MotiView>
        </ScrollView>
    );
}
