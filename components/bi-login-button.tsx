import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import {
    exchangeCodeAsync,
    makeRedirectUri,
    useAuthRequest,
    useAutoDiscovery,
} from 'expo-auth-session';
import { Button, Text, Spinner } from 'tamagui';
import { Alert } from 'react-native';
import { useProfile } from './context/core/profile-provider';
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';


WebBrowser.maybeCompleteAuthSession();

async function fetchUserEmail(accessToken: string) {
    try {
        const response = await fetch('https://graph.microsoft.com/oidc/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(i18next.t('failed-to-fetch-user-email'));
        }

        const data = await response.json();
        return data.email;
    } catch (error) {
        console.error('Error fetching user email:', error);
        throw error;
    }
}

export function BILoginButton() {
    const { t } = useTranslation();
    const discovery = useAutoDiscovery('https://login.microsoftonline.com/adee44b2-91fc-40f1-abdd-9cc29351b5fd/v2.0');
    const redirectUri = makeRedirectUri({
        scheme: 'biso',
        path: 'profile',
    });

    const { actions: profileActions } = useProfile();
    const clientId = '09d8bb72-2cef-4b98-a1d3-2414a7a40873';
    const [isReady, setIsReady] = useState(false);
    const [loading, setLoading] = useState(false);

    const [request, , promptAsync] = useAuthRequest({
        clientId,
        scopes: ['openid', 'email'],
        redirectUri,
    }, discovery);


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
                    throw new Error(t('failed-to-login-with-bi'));
                }

                const email = await fetchUserEmail(accessToken);
                if (!email.endsWith('@bi.no') && !email.endsWith('@biso.no')) {
                    throw new Error(t('please-use-a-valid-email-address-ending-with-bi-no-or-biso-no'));
                }

                const studentId = email.replace(/@bi.no|@biso.no/, '');
                await profileActions.addStudentId(studentId);
            }
        } catch (error) {
            Alert.alert(t('login-error'), error instanceof Error ? error.message : t('an-error-occurred-during-login'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onPress={handleLogin} variant='outlined' disabled={!isReady}>
            {loading && <Spinner size="small" />}
            <Text>{t('login-with-bi')}</Text>
        </Button>
    );
}
