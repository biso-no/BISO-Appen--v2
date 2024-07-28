import { Button, XStack, XGroup, YStack, Text, ScrollView, YGroup } from "tamagui";
import { useState } from "react";
import { MemberAccess } from "@/components/explore/member-access";
import { Newspaper, Calendar } from "@tamagui/lucide-icons";
import { UsefulLinks } from "@/components/explore/links";
import { useModal } from "@/components/context/membership-modal-provider";

export default function ExploreScreen() {


    return (
        <ScrollView space="$4" padding="$3">
            <YGroup space="$4">
                <YGroup.Item>
                    <XStack space="$4" alignItems="center" justifyContent="center">
                        <Button size="$5" width="$13" icon={<Newspaper size={20} />}>
                            <Text fontSize="$4">News</Text>
                            
                        </Button>
                        <Button size="$5" width="$13" icon={<Calendar size={20} />}>
                            <Text fontSize="$4">Events</Text>
                        </Button>
                    </XStack>
                </YGroup.Item>
                </YGroup>
                <MemberAccess />
                <UsefulLinks />
            </ScrollView>
        )
    }