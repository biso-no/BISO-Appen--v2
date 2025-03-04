import { H1, H3, YStack, Button } from 'tamagui';
import * as SecureStore from 'expo-secure-store';
import { useState, useEffect } from 'react';

export default function OAuthScreen() {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        SecureStore.getItemAsync('accessToken').then((token) => {
            setToken(token);
        });
    }, []);

    if (!token) {
        return null;
    }

    return (
        <YStack flex={1} justifyContent="center" alignItems="center">
            <H1>OAuth Success</H1>
            <H3>Token: {token}</H3>
            <Button onPress={() => SecureStore.deleteItemAsync('accessToken')}>Delete Token</Button>
        </YStack>
    );
}