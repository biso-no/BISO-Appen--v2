import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { YStack, H1, Text, Spinner } from "tamagui";
import { CheckCircle, XCircle } from "@tamagui/lucide-icons";
import { MyStack } from "@/components/ui/MyStack";
import { createSession } from "@/lib/appwrite";
import { useAuth } from "@/components/context/core/auth-provider";

//A callback screen that verifies the code from the email. If the code is valid, a large checkmark with animation is shown, and the user is redirected to the home screen.
export default function VerifyScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const secret = params.secret as string;
    const userId = params.userId as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { actions } = useAuth();

    useEffect(() => {
        async function verifyMagicLink() {
            if (!secret || !userId) {
                setError("Invalid verification link");
                setIsLoading(false);
                return;
            }

            try {
                const session = await createSession(userId, secret);
                if (session.$id) {
                    setIsVerified(true);
                } else {
                    setError("Invalid or expired verification link");
                }
            } catch (err) {
                setError("Failed to verify link. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }

        verifyMagicLink();
    }, [secret, userId]);

    useEffect(() => {
        if (isVerified) {
            const timer = setTimeout(() => {
                router.replace("/");
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [isVerified, router]);

    return (
        <MyStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
            {isLoading ? (
                <YStack gap="$4" alignItems="center">
                    <Spinner size="large" color="$blue10" />
                    <Text>Verifying your login...</Text>
                </YStack>
            ) : isVerified ? (
                <YStack gap="$4" alignItems="center">
                    <CheckCircle size={64} color="$green10" />
                    <H1 color="$green10">Success!</H1>
                    <Text>You'll be redirected shortly...</Text>
                </YStack>
            ) : (
                <YStack gap="$4" alignItems="center">
                    <XCircle size={64} color="$red10" />
                    <H1 color="$red10">Verification Failed</H1>
                    <Text color="$red10">{error}</Text>
                    <Text 
                        color="$blue10" 
                        onPress={() => router.replace("/auth/signIn")}
                        pressStyle={{ opacity: 0.8 }}
                    >
                        Try signing in again
                    </Text>
                </YStack>
            )}
        </MyStack>
    );
}