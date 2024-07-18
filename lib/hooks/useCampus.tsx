import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/components/context/auth-provider';
import * as AsyncStorage from '@react-native-async-storage/async-storage';
import { Models } from 'react-native-appwrite';

const CampusContext = createContext<string | null>(null);

export const useCampus = () => {
    const context = useContext(CampusContext) || "national";
    if (context === undefined) {
        throw new Error('useCampus must be used within a CampusProvider');
    }
    const [campus, setCampus] = useState<string>(context);

    const onChange = async (newCampus: string) => {
        setCampus(newCampus);
        try {
            await AsyncStorage.default.setItem('campus', newCampus);
        } catch (error) {
            console.error('Error saving campus to async storage:', error);
        }
    };

    return { campus, onChange };
};

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [campus, setCampus] = useState<string | null>(null);
    const { data } = useAuth();

    useEffect(() => {
        fetchCampusFromStorage().then((storedCampus) => {
            if (storedCampus) {
                setCampus(storedCampus);
            } else if (data && data.prefs && !storedCampus) {
                fetchCampusFromAppwrite(data).then((appwriteCampus) => {
                    if (appwriteCampus) {
                        setCampus(appwriteCampus);
                    }
                });
            }
        })

    }, [data]);

    return (
        <CampusContext.Provider value={campus}>
            {children}
        </CampusContext.Provider>   
    );
}

const fetchCampusFromStorage = async () => {
    try {
        const storedCampus = await AsyncStorage.default.getItem('campus');
        if (storedCampus !== null) {
            return storedCampus;
        }
    } catch (error) {
        console.error('Error fetching campus from async storage:', error);
    }
    return null;
}

const fetchCampusFromAppwrite = async (user?: Models.User<Models.Preferences>) => {
    try {
        const response = await user?.prefs?.campus;
        if (response) {
            return response;
        }
    } catch (error) {
        console.log("Found no campus in Appwrite", error);
        return null;
    }

    return null;
}