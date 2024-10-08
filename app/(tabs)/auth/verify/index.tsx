import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { YStack, H1, XStack, YGroup, XGroup, Card, Separator, Text, View, H4, Spinner } from "tamagui";
import { CheckCircle } from "@tamagui/lucide-icons";
import { MyStack } from "@/components/ui/MyStack";
import { verifyMagicUrl } from "@/lib/appwrite";

//A callback screen that verifies the code from the email. If the code is valid, a large checkmark with animation is shown, and the user is redirected to the home screen.
export default function VerifyCodeScreen() {
    
    const router = useRouter();
    const params = useLocalSearchParams();
    const secret = params.secret as string;
    const userId = params.userId as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if (secret && userId) {
            setIsLoading(true);
            verifyMagicUrl(userId, secret)
                .then((response) => {
                    if (response.$id) {
                        setIsVerified(true);
                    } else {
                        setIsVerified(false);
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [secret, userId]);

    useEffect(() => {
        if (isVerified) {
            setTimeout(() => {
                router.push("/");
            }, 1000);
        }
    }, [isVerified]);

    return (
        <YStack flex={1} justifyContent="center" alignItems="center">
            {isLoading ? (
                <Spinner size="large" />
            ) : isVerified ? (
                <CheckCircle size={100} color="green" />
            ) : (
                <Text>Invalid code</Text>
            )}
        </YStack>
    );
}