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
import { Button, Text, YStack } from 'tamagui';
import { Alert } from 'react-native';
import { useAuth } from './context/auth-provider';
import { databases } from '@/lib/appwrite';
import { useLocalSearchParams } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

async function fetchUserEmail(accessToken: string) {
    console.log('Fetching user email with access token:', accessToken);
    const response = await fetch('https://graph.microsoft.com/oidc/userinfo', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    console.log('Response:', response);

    if (!response.ok) {
        console.error('Failed to fetch user email, response status:', response.status);
        throw new Error('Failed to fetch user email');
    }

    const data = await response.json();
    console.log('Fetched user data:', data);
    return data.email
}

export function BILoginButton() {
    const params = useLocalSearchParams();



    const discovery = useAutoDiscovery('https://login.microsoftonline.com/adee44b2-91fc-40f1-abdd-9cc29351b5fd/v2.0');
    console.log('Discovery:', discovery);

    const redirectUri = makeRedirectUri({
        scheme: 'biso',
        path: 'profile',
    });
    console.log('Redirect URI:', redirectUri);

    const { profile, addStudentId, data } = useAuth();
    console.log('User profile:', profile);

    const clientId = '09d8bb72-2cef-4b98-a1d3-2414a7a40873';
    const [token, setToken] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    const [request, response, promptAsync] = useAuthRequest({
        clientId,
        scopes: ['openid', 'email'],
        redirectUri,
    }, discovery);

    useEffect(() => {
        if (request && discovery) {
            console.log('Request and discovery are set, making login ready.');
            setIsReady(true);
        }
    }, [request, discovery]);

    useEffect(() => {
        if (!params.code && !discovery) return;
        console.log('Code received:', params.code);
        exchangeCodeAsync(
            {
                clientId,
                code: params.code as string,
                extraParams: request?.codeVerifier
                    ? { code_verifier: request.codeVerifier }
                    : undefined,
                redirectUri,
            },
            discovery as Pick<DiscoveryDocument, 'tokenEndpoint'>,
        ).then(async (res) => {
            const email = await fetchUserEmail(res.accessToken);
            if (!email.endsWith('@bi.no') && !email.endsWith('@biso.no')) {
                Alert.alert("Invalid Email", "Please use a valid email address ending with @bi.no or @biso.no");
                return;
            }

            const studentId = email.replace(/@bi.no|@biso.no/, '');
            console.log('Student ID:', studentId);
            await addStudentId(studentId);
        }).catch((err) => {
            console.error('Error exchanging code for token:', err);
            setError(err.message);
            Alert.alert("Login Error", err.message);
        });
    }, []);


    const handleLogin = async () => {
        promptAsync()
    };
    return (
        <Button onPress={handleLogin} variant='outlined' disabled={!isReady}>
            <Text>Login with BI</Text>
        </Button>
    );
}
