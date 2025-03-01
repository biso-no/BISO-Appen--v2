import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import {
    DiscoveryDocument,
    exchangeCodeAsync,
    makeRedirectUri,
    useAuthRequest,
    useAutoDiscovery,
} from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { Button, Text, YStack, Spinner } from 'tamagui';
import { Alert } from 'react-native';
import { useAuth } from './context/core/auth-provider';
import { useProfile } from './context/core/profile-provider';
import { useMembershipContext } from './context/core/membership-provider';
import { databases } from '@/lib/appwrite';
import { useLocalSearchParams } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

async function fetchUserEmail(accessToken: string) {
    try {
        const response = await fetch('https://graph.microsoft.com/oidc/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user email');
        }

        const data = await response.json();
        return data.email;
    } catch (error) {
        console.error('Error fetching user email:', error);
        throw error;
    }
}

export function BILoginButton() {
    const params = useLocalSearchParams();
    const discovery = useAutoDiscovery('https://login.microsoftonline.com/adee44b2-91fc-40f1-abdd-9cc29351b5fd/v2.0');
    const redirectUri = makeRedirectUri({
        scheme: 'biso',
        path: 'profile',
    });

    const { user, actions } = useAuth();
    const { actions: profileActions } = useProfile();
    const clientId = '09d8bb72-2cef-4b98-a1d3-2414a7a40873';
    const [isReady, setIsReady] = useState(false);
    const [loading, setLoading] = useState(false);

    const [request, , promptAsync] = useAuthRequest({
        clientId,
        scopes: ['openid', 'email'],
        redirectUri,
    }, discovery);

    // Only log discovery info once when component mounts
    useEffect(() => {
        if (discovery) {
            console.log('Auth discovery completed');
        }
    }, [discovery]);

    useEffect(() => {
        if (request && discovery) {
            setIsReady(true);
        }
    }, [request, discovery]);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const code = await promptAsync();
            if (code.type === 'success' && discovery) {
                const { accessToken } = await exchangeCodeAsync({
                    clientId,
                    code: code.params.code,
                    extraParams: request?.codeVerifier
                        ? { code_verifier: request.codeVerifier }
                        : undefined,
                    redirectUri,
                }, discovery);

                if (!accessToken) {
                    throw new Error("Failed to login with BI");
                }

                const email = await fetchUserEmail(accessToken);
                if (!email.endsWith('@bi.no') && !email.endsWith('@biso.no')) {
                    throw new Error("Please use a valid email address ending with @bi.no or @biso.no");
                }

                const studentId = email.replace(/@bi.no|@biso.no/, '');
                await profileActions.addStudentId(studentId);
            }
        } catch (error) {
            Alert.alert("Login Error", error instanceof Error ? error.message : "An error occurred during login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onPress={handleLogin} variant='outlined' disabled={!isReady}>
            {loading && <Spinner size="small" />}
            <Text>Login with BI</Text>
        </Button>
    );
}
