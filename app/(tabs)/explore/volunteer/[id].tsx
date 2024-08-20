import RenderHTML from "react-native-render-html";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, YStack, useTheme, Card, Separator, H5, Spinner, ScrollView, Button } from "tamagui";
import { useCampus } from "@/lib/hooks/useCampus";
import axios from "axios";
import { useWindowDimensions } from "react-native";
import { MotiView } from 'moti';

export default function VolunteerScreen() {
    const params = useLocalSearchParams();
    const { width } = useWindowDimensions();

    const [job, setJob] = useState<{ id: number, title: string, content: string, url: string }>({ id: 0, title: "", content: "", url: "" });
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    const theme = useTheme();
    const { campus } = useCampus();
    const jobId = params.id;

    useEffect(() => {
        console.log("Job ID:", jobId);
    }, [jobId]);

    const textColor = theme?.color?.val;

    const htmlStyles = {
        body: { 
            fontSize: 16, 
            lineHeight: 24, 
            color: textColor,
        },
    };

    const titleStyles = {
        body: { 
            fontSize: 24, 
            lineHeight: 32, 
            color: textColor,
        },
    };

    useEffect(() => {
        setLoading(true);
        axios.get('https://biso.no//wp-json/custom/v1/jobs/?includeExpired=true&job_id=' + jobId)
            .then((response) => {
                console.log("Response:", response);
                setJob(response.data[0]);
                setLoading(false); // Move this here to ensure it runs after data is fetched
            })
            .catch((error) => {
                console.error("Error fetching jobs:", error);
                setLoading(false); // Ensure loading is set to false even on error
            });
    }, [params.id]);

    // If loading, show a large spinner in the center of the screen
    if (loading) {
        return (
            <YStack flex={1} justifyContent="center" alignItems="center">
                <Spinner size="large" />
            </YStack>
        );
    }
    

    return (
        <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
        <ScrollView>
        <YStack space="$4" padding="$4">
            <RenderHTML
                source={{ html: job?.title }}
                contentWidth={width - 40}
                tagsStyles={titleStyles}
            />
            <Button onPress={() => router.push(job?.url)}>View on BISO.no</Button>
            <Separator />
            <RenderHTML
                source={{ html: job?.content }}
                contentWidth={width - 40}
                tagsStyles={htmlStyles}
            />
        </YStack>
        </ScrollView>
        </MotiView>
    );
}
