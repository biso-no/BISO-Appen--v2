import { CheckCircle } from "@tamagui/lucide-icons";
import { acceptChatInvite } from "@/lib/appwrite";
import { RelativePathString, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { MotiView } from 'moti'
import { Text } from "tamagui";
import { useRouter } from "expo-router";
import { useAuth } from "@/components/context/core/auth-provider";

export default function TeamInvitation() {
    const params = useLocalSearchParams();


    const { membershipId, secret, teamId, userId } = params as {
        membershipId: string;
        secret: string;
        teamId: string;
        userId: string;
    };

    const { push } = useRouter();



    useEffect(() => {
        if (membershipId && secret && teamId && userId) {
            acceptChatInvite({
                membershipId,
                secret,
                teamId,
                userId,
            }).then(() => {
                push("/(tabs)/chat" as RelativePathString);
            });
        }
    }, [membershipId, secret, teamId, userId]);


    return (
        <MotiView
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <CheckCircle size={64} color="green" />
            <Text
                style={{
                    textAlign: "center",
                }}
            >
                Invitation Accepted
            </Text>
        </MotiView>
    );
}