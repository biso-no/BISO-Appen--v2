import { Button, XStack, XGroup, YStack, Text, ScrollView, YGroup } from "tamagui";
import { useState } from "react";
import { MemberAccess } from "@/components/explore/member-access";
import { Newspaper, Calendar, WalletCards } from "@tamagui/lucide-icons";
import { UsefulLinks } from "@/components/explore/links";
import { useModal } from "@/components/context/membership-modal-provider";
import { useRouter } from "expo-router";
import { useWindowDimensions } from "react-native";
import { useAuth } from "@/components/context/auth-provider";

export default function ExploreScreen() {

    const { push } = useRouter();

    const { height, width } = useWindowDimensions();
    const { openModal } = useModal();
    const { data } = useAuth();
    return (
        <YStack minHeight={height - 100} justifyContent="center" alignItems="center">
        <ScrollView space="$4">
            <YGroup space="$4" padding="$3">
                <YGroup.Item>
                    <XStack space="$4" alignItems="center" justifyContent="center">
                        <Button bordered backgroundColor={"$color1"} onPress={() => push("/explore/news")} size="$4" width="$12" icon={<Newspaper size={20} />}>
                            <Text fontSize="$4">News</Text>
                            
                        </Button>
                        <Button bordered backgroundColor={"$color1"} onPress={() => push("/explore/events")} size="$4" width="$12" icon={<Calendar size={20} />}>
                            <Text fontSize="$4">Events</Text>
                        </Button>
                    </XStack>
                    {data?.$id && (
                    <Button bordered backgroundColor={"$color1"} onPress={() => push("/explore/expenses")} size="$4" width="$12" icon={<WalletCards size={20} />} marginTop="$4">
                            <XStack space="$2" alignItems="center" justifyContent="center"></XStack>
                            <Text fontSize="$4">Expenses</Text>
                    </Button>
                    )}
                </YGroup.Item>
                </YGroup>
                <MemberAccess />
                <UsefulLinks />

            </ScrollView>
            <Button onPress={() => push("/bug-report")} chromeless position="absolute" bottom={0} zIndex={1000}>
                    <Text>Report a bug</Text>
                </Button>
        </YStack>
        )
    }