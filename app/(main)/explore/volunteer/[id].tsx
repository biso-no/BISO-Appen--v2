import RenderHTML from "react-native-render-html";
import { RelativePathString, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { YStack, useTheme, Separator, Spinner, ScrollView, Button } from "tamagui";

import axios from "axios";
import { useWindowDimensions } from "react-native";
import { MotiView } from 'moti';
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';

export default function VolunteerScreen() {
    const params = useLocalSearchParams();
    const { width } = useWindowDimensions();
    const { t } = useTranslation();
    const [job, setJob] = useState<{ id: number, title: string, content: string, url: string }>({ id: 0, title: "", content: "", url: "" });
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    const theme = useTheme();
    const jobId = params.id;


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
                setJob(response.data[0]);
                setLoading(false); // Move this here to ensure it runs after data is fetched
            })
            .catch((error) => {
                console.error("Error fetching jobs:", error);
                setLoading(false); // Ensure loading is set to false even on error
            });
    }, [params.id, jobId]);

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
        <YStack gap="$4" padding="$4">
            <RenderHTML
                source={{ html: job?.title }}
                contentWidth={width - 40}
                tagsStyles={titleStyles}
            />
            <Button onPress={() => router.push(job?.url as RelativePathString)}>{t('view-on-biso-no')}</Button>
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
