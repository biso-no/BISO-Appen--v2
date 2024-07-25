import { Check, Cross } from "@tamagui/lucide-icons";
import { useEffect, useState } from "react";
import { H1, H3, H5, Paragraph, YStack, Button, Text, Input, Spinner, Separator } from "tamagui";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/components/context/auth-provider";
import { createSession } from "@/lib/appwrite";


export default function OAuthStatusScreen() {
    
    const searchParams = useLocalSearchParams();

    const { secret } = useLocalSearchParams();

    const { status } = searchParams;
    const router = useRouter();
    const { data } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "success" && data && secret) {
            createSession(data.$id, secret[0]).then(response => {
                console.log(response);
                setLoading(false);
            });
        }
    }, [status, data, secret]);


    if (status === "error") {
        return (
            <YStack space="$4" padding="$4">
                <H1>Error!</H1>
                <Paragraph>An error occurred while signing in with BISO.</Paragraph>
                <Button onPress={() => router.push("/")}>Go to Home</Button>
            </YStack>
        )
    }

    if (loading) {
        return (
            <YStack space="$4" padding="$4">
                <H1>Loading...</H1>
                <Spinner size="large" />
            </YStack>
        )
    }

    return (
        <YStack space="$4" padding="$4">
            <H1>Success!</H1>
            <Paragraph>You have successfully signed in with BISO.</Paragraph>
            <Button onPress={() => router.push("/profile")}>Go to Profile</Button>
        </YStack>
    )
}