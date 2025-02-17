import { MyStack } from "@/components/ui/MyStack";
import { YStack, Card, Paragraph, Image, ScrollView, XGroup, H3 } from "tamagui";
import { useEffect, useState } from 'react';
import type { Models } from "react-native-appwrite";
import { useCampus } from "@/lib/hooks/useCampus";

export default function DepartmentsScreen() {

   //Display no benefits currently added in the app yet.
    return (
        <ScrollView>
        <MyStack>
            <YStack gap="$4" alignItems="center" justifyContent="center">
                <H3>Coming soon</H3>
            </YStack>
        </MyStack>
        </ScrollView>
    )
}