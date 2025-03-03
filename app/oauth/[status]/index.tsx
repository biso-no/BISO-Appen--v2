
import { useEffect, useState } from "react";
import { H1, Paragraph, YStack, Button, Spinner } from "tamagui";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/components/context/core/auth-provider";
import { createSession } from "@/lib/appwrite";


export default function OAuthStatusScreen() {
    
    const searchParams = useLocalSearchParams();

    const { secret } = useLocalSearchParams();

    const { status } = searchParams;
    const router = useRouter();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "success" && user && secret) {
            createSession(user.$id, secret[0]).then(response => {
                setLoading(false);
            });
        }
    }, [status, user, secret]);


    if (status === "error") {
        return (
            <YStack gap="$4" padding="$4">
                <H1>Error!</H1>
                <Paragraph>An error occurred while signing in with BISO.</Paragraph>
                <Button onPress={() => router.push("/")}>Go to Home</Button>
            </YStack>
        )
    }

    if (loading) {
        return (
            <YStack gap="$4" padding="$4">
                <H1>Loading...</H1>
                <Spinner size="large" />
            </YStack>
        )
    }

    return (
        <YStack gap="$4" padding="$4">
            <H1>Success!</H1>
            <Paragraph>You have successfully signed in with BISO.</Paragraph>
            <Button onPress={() => router.push("/profile")}>Go to Profile</Button>
        </YStack>
    )
}