import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import {
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

    const [request, , promptAsync] = useAuthRequest({
        clientId,
        scopes: ['openid', 'profile', 'email', 'offline_access'],
        redirectUri,
    }, discovery);

    useEffect(() => {
        if (request && discovery) {
            console.log('Request and discovery are set, making login ready.');
            setIsReady(true);
        }
    }, [request, discovery]);

    const handleLogin = () => {
        console.log('Login button pressed. IsReady:', isReady);
        if (isReady) {
            promptAsync().then((codeResponse) => {
                console.log('Prompt async response:', codeResponse);
                if (codeResponse?.type === 'success') {
                    exchangeCodeAsync(
                        {
                            clientId,
                            code: codeResponse.params.code,
                            extraParams: request?.codeVerifier
                                ? { code_verifier: request.codeVerifier }
                                : undefined,
                            redirectUri,
                        },
                        discovery!,
                    ).then((res) => {
                        console.log('Access token exchange successful:', res);
                        setToken(res.accessToken);
                        //SecureStore.setItemAsync('accessToken', res.accessToken);

                        // Fetch user email
                        fetchUserEmail(res.accessToken).then(async (email) => {
                            console.log('User email fetched:', email);
                            setEmail(email);

                            // Ensure the email ends with @bi.no or @biso.no
                            if (!email.endsWith('@bi.no') && !email.endsWith('@biso.no')) {
                                Alert.alert("Invalid Email", "Please use a valid email address ending with @bi.no or @biso.no");
                                return;
                            }

                            // Remove @bi.no or @biso.no from the email, then update the user profile with the studentId
                            const studentId = email.replace(/@bi.no|@biso.no/, '');
                            console.log('Student ID:', studentId);
                            const response = await databases.createDocument('app', 'student_id', studentId, { 
                                student_id: studentId,
                                user: data?.$id
                            });
                            if (data?.$id && response.$id) {
                                await databases.updateDocument('app', 'user', data.$id, { 
                                    student_id: studentId
                                });
                                console.log('Student ID updated:', studentId);
                            }
                            console.log('Response:', response);
                            console.log('User email set:', email);
                        }).catch((err) => {
                            console.error('Error fetching user email:', err);
                            setError(err.message);
                            Alert.alert("Fetch Error", err.message);
                        });
                    }).catch((err) => {
                        console.error('Error exchanging code for token:', err);
                        setError(err.message);
                        Alert.alert("Login Error", err.message);
                    });
                } else {
                    console.error('Code response was not successful:', codeResponse);
                }
            }).catch((err) => {
                console.error('Error during promptAsync:', err);
                setError(err.message);
                Alert.alert("Login Error", err.message);
            });
        } else {
            console.error('Login attempt when request is not ready.');
            Alert.alert("Login Error", "Request is not ready, please try again.");
        }
    }

    return (
        <Button onPress={handleLogin} variant='outlined'>
            <Text>Login with BI</Text>
        </Button>
    );
}
