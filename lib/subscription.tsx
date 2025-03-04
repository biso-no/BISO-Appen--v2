import { useEffect, useState } from 'react';
import { RealtimeResponseEvent } from 'react-native-appwrite';
import { client } from './appwrite';

export const useSubscription = (
    channel: string,
    collectionId: string | null,
    documentId: string | undefined,
    callback: (response: RealtimeResponseEvent<unknown>) => void
) => {
    const [payload, setPayload] = useState<unknown | null>(null);

    useEffect(() => {
        let subscriptionChannel = channel;

        if (collectionId) {
            subscriptionChannel = `${subscriptionChannel}.collections.${collectionId}`;
            if (documentId) {
                subscriptionChannel = `${subscriptionChannel}.documents.${documentId}`;
            }
        }

        const unsubscribe = client.subscribe(subscriptionChannel, response => {
            setPayload(response.payload); // Update the state with the payload
            callback(response);
        });

        // Cleanup subscription on unmount
        return () => {
            unsubscribe();
        };
    }, [channel, collectionId, documentId, callback]);

    return payload;
};