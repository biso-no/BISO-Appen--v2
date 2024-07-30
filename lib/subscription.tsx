import { client } from './appwrite';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/context/auth-provider';

export const useSubscription = (topic: string, callback: (response: any) => void) => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const { data } = useAuth();

    useEffect(() => {
        if (data?.$id) {
            const unsubscribe = client.subscribe(
                [`databases.app.collections.user.documents.${data.$id}`],
                (response) => {
                    console.log(response);
                    callback(response);
                }
            );

            setIsSubscribed(true);

            return () => {
                unsubscribe();
                setIsSubscribed(false);
            };
        }
    }, [data?.$id, callback]);

    return isSubscribed;
};
