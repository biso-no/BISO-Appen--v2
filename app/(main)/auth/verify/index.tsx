import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { YStack, H1, Text, Spinner } from "tamagui";
import { CheckCircle, XCircle } from "@tamagui/lucide-icons";
import { MyStack } from "@/components/ui/MyStack";
import { createSession } from "@/lib/appwrite";
import { useAuth } from "@/lib/hooks/useAuthStore";
import { queryClient } from '@/lib/react-query';
import { useTranslation } from "react-i18next";
//A callback screen that verifies the code from the email. If the code is valid, a large checkmark with animation is shown, and the user is redirected to the home screen.
export default function VerifyScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const secret = params.secret as string;
    const userId = params.userId as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();
    // Get the refetch function from useAuth to refresh user data after authentication
    const { actions } = useAuth();

    useEffect(() => {
        async function verifyMagicLink() {
            if (!secret || !userId) {
                setError(t('invalid-verification-link'));
                setIsLoading(false);
                return;
            }

            try {
                const session = await createSession(userId, secret);
                if (session.$id) {
                    setIsVerified(true);
                    // Invalidate the account query to refetch user data
                    queryClient.invalidateQueries({ queryKey: ['account'] });
                    // Also directly refetch the user data to ensure immediate state update
                    await actions.refetch();
                } else {
                    setError(t('invalid-or-expired-verification-link'));
                }
            } catch (err) {
                setError(t('failed-to-verify-link-please-try-again'));
            } finally {
                setIsLoading(false);
            }
        }

        verifyMagicLink();
    }, [secret, userId, actions, t]);

    useEffect(() => {
        if (isVerified) {
            const timer = setTimeout(() => {
                router.replace("/");
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isVerified, router]);

    return (
        <MyStack>
            <YStack alignItems="center" justifyContent="center" flex={1} space>
                {isLoading ? (
                    <>
                        <Spinner size="large" />
                        <Text>{t('verifying-your-account')}</Text>
                    </>
                ) : isVerified ? (
                    <>
                        <CheckCircle size={100} color="$green10" />
                        <H1>Success!</H1>
                        <Text>{t('your-account-has-been-verified')}</Text>
                        <Text>{t('youll-be-redirected-shortly')}</Text>
                    </>
                ) : (
                    <>
                        <XCircle size={100} color="$red10" />
                        <H1>{t('verification-failed')}</H1>
                        <Text>{error || t('unknown-error-occurred')}</Text>
                    </>
                )}
            </YStack>
        </MyStack>
    );
}