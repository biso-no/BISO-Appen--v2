import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import {
    YStack,
    H1,
    XStack,
    YGroup,
    XGroup,
    Card,
    Separator,
    Button,
    Text,
    View,
    Image,
    ScrollView,
    useTheme,
    H4,
    Spinner
} from "tamagui";
import { Calendar, CheckCircle, ChevronRight, Clock } from "@tamagui/lucide-icons";
import { getFormattedDateFromString } from "@/lib/format-time";
import { useCampus } from "@/lib/hooks/useCampus";
import { Models } from "react-native-appwrite";
import { MyStack } from "@/components/ui/MyStack";
import { useElections } from "@/lib/hooks/useElections";
import { useWindowDimensions, RefreshControl } from "react-native";
import { Election } from "@/types/election";

export default function ElectionsScreen() {
    const { pastElections, upcomingElections, isLoading, startedElections, refetch } = useElections();
    const { width } = useWindowDimensions();
    const router = useRouter();
    const { campus } = useCampus();

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch(); // Assuming refetch is a function that reloads the elections data
        setRefreshing(false);
    }, [refetch]);

    function renderElectionCard(election: Partial<Election>, icon: JSX.Element) {
        return (
            <Card
                key={election.$id}
                width={width - 40}
                onPress={() => router.push(`/(tabs)/explore/elections/${election.$id}`)}
            >
                <XStack gap="$4" alignItems="center" width="100%" justifyContent="space-between" padding="$2">
                    <XGroup gap="$4" alignItems="center" justifyContent="center">
                        {icon}
                        <YGroup space="$2">
                            <H4>{election.name}</H4>
                            <Text>{election.date ? getFormattedDateFromString(election.date) : "No date specified"}</Text>
                        </YGroup>
                    </XGroup>
                    <ChevronRight size={20} />
                </XStack>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <YStack flex={1} justifyContent="center" alignItems="center">
                <Spinner size="large" />
            </YStack>
        );
    }

    if (!upcomingElections.length && !pastElections.length && !startedElections.length) {
        return (
            <YStack flex={1} justifyContent="center" alignItems="center">
                <Text>No elections found</Text>
            </YStack>
        );
    }

    return (
        <ScrollView
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <YStack gap="$4" padding="$4">
                {startedElections.length > 0 && (
                    <YStack gap="$4">
                        <H4>Ongoing Elections</H4>
                        <YGroup space="$4">
                            {startedElections.map((election) =>
                                renderElectionCard(election, <Clock size={20} color="green" />)
                            )}
                        </YGroup>
                    </YStack>
                )}
                {upcomingElections.length > 0 && (
                    <YStack gap="$4">
                        <H4>Upcoming Elections</H4>
                        <YGroup space="$4">
                            {upcomingElections.map((election) =>
                                renderElectionCard(election, <CheckCircle size={20} color="yellow" />)
                            )}
                        </YGroup>
                    </YStack>
                )}
                {pastElections.length > 0 && (
                    <YStack gap="$4">
                        <H4>Past Elections</H4>
                        <YGroup gap="$4">
                            {pastElections.map((election) =>
                                renderElectionCard(election, <Calendar size={20} color="blue" />)
                            )}
                        </YGroup>
                    </YStack>
                )}
            </YStack>
        </ScrollView>
    );
}
