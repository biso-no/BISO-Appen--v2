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

WebBrowser.maybeCompleteAuthSession();

async function fetchUserEmail(accessToken: string) {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user email');
    }

    const data = await response.json();
    return data.mail || data.userPrincipalName; // Fallback to userPrincipalName if mail is not available
}

export function BILoginButton() {
    const discovery = useAutoDiscovery('https://login.microsoftonline.com/74a117b9-9343-4c86-b44d-398c88ba1ed8/v2.0');

    const redirectUri = makeRedirectUri({
        scheme: 'biso',
        path: 'profile',
    });

    const { profile, addStudentId } = useAuth();

    const clientId = '170c512f-d560-4afb-99cb-8ef98c6b2a42';
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
            setIsReady(true);
        }
    }, [request, discovery]);

    const handleLogin = () => {
        if (isReady) {
            promptAsync().then((codeResponse) => {
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
                        setToken(res.accessToken);
                        //SecureStore.setItemAsync('accessToken', res.accessToken);

                        // Fetch user email
                        fetchUserEmail(res.accessToken).then((email) => {
                            setEmail(email);
                            //Ensure the email ends with @bi.no or @biso.no
                            if (!email.endsWith('@bi.no') && !email.endsWith('@biso.no')) {
                                Alert.alert("Invalid Email", "Please use a valid email address ending with @bi.no or @biso.no");
                                return;
                            }

                            // Remove @bi.no or @biso.no from the email, then update the user profile with the studentId
                            const studentId = email.replace(/@bi.no|@biso.no/, '');
                            console.log('Student ID: ', studentId);
                            addStudentId(studentId);
                            console.log('User email: ', email);
                        }).catch((err) => {
                            setError(err.message);
                            Alert.alert("Fetch Error", err.message);
                        });
                    }).catch((err) => {
                        setError(err.message);
                        Alert.alert("Login Error", err.message);
                    });
                }
            }).catch((err) => {
                setError(err.message);
                Alert.alert("Login Error", err.message);
            });
        } else {
            Alert.alert("Login Error", "Request is not ready, please try again.");
        }
    }

    return (
            <Button onPress={handleLogin} variant='outlined'>
                <Text>Login with BI</Text>
            </Button>
    );
}