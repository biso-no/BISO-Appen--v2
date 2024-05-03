import { useState, useEffect } from 'react';
import { getAccount, getUserProfile, updateUserName, updateUserPreferences } from '@/lib/appwrite';
import { Models } from 'appwrite';

export const useAppwriteAccount = () => {
    const [data, setData] = useState<Models.User<Models.Preferences> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccount = async () => {
            setIsLoading(true);
            try {
                const response = await getAccount();
                setData(response);
                setError(null);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
                setData(null);
            } finally {
                setIsLoading(false);
            }
        };
        

        fetchAccount();
    }, []);


    const updateName = async (name: string) => {
        try {
            const response = await updateUserName(name);
            setData(response); // Update the local state with the new data
            setError(null);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        }
    };

    const updatePrefs = async (preferences: string[]) => {
        try {
            const response = await updateUserPreferences(preferences);
            setData(response); // Update the local state with the new data
            setError(null);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        }
    };


    return { data, isLoading, error, updateName, updatePrefs };
};