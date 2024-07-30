import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/components/context/auth-provider';
import * as AsyncStorage from '@react-native-async-storage/async-storage';
import { Models } from 'react-native-appwrite';
import { getDocuments } from '@/lib/appwrite';

type PartialCampus = {
    $id: string;
    name: string;
};

type Campus = {
    id: string;
    name: string;
};

const CampusContext = createContext<{
    campus: Models.Document | null,
    setCampus: React.Dispatch<React.SetStateAction<Models.Document | null>>
    availableCampuses: Campus[]
} | undefined>(undefined);

export const useCampus = () => {
    const context = useContext(CampusContext);
    if (context === undefined) {
        throw new Error('useCampus must be used within a CampusProvider');
    }
    const { campus, setCampus, availableCampuses } = context;

    const onChange = async (newCampus: Models.Document) => {
        setCampus(newCampus);
        try {
            const campusData: PartialCampus = {
                $id: newCampus.$id,
                name: newCampus.name
            };
            await AsyncStorage.default.setItem('campus', JSON.stringify(campusData));
            console.log('Saved to storage:', campusData);
        } catch (error) {
            console.error('Error saving campus to async storage:', error);
        }
    };

    return { campus, onChange, availableCampuses };
};

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [campus, setCampus] = useState<Models.Document | null>(null);
    const availableCampuses = [
        { id: "1", name: 'Oslo' },
        { id: "2", name: 'Bergen' },
        { id: "3", name: 'Trondheim' },
        { id: "4", name: 'Stavanger' },
        { id: "5", name: 'National' },
    ]
    const [loading, setLoading] = useState(true);
    const { profile } = useAuth();

    useEffect(() => {
        const initializeCampus = async () => {
            const storedCampus = await fetchCampusFromStorage();
            if (storedCampus) {
                setCampus(storedCampus);
            } else if (profile && profile.campus) {
                const appwriteCampus = await fetchCampusFromAppwrite(profile);
                if (appwriteCampus) {
                    setCampus(appwriteCampus);
                }
            }
            setLoading(false);
        };

        initializeCampus();
    }, [profile]);

    if (loading) {
        return null; // or a loading spinner
    }

    return (
        <CampusContext.Provider value={{ campus, setCampus, availableCampuses }}>
            {children}
        </CampusContext.Provider>
    );
};

const fetchCampusFromStorage = async (): Promise<Models.Document | null> => {
    try {
        const storedCampus = await AsyncStorage.default.getItem('campus');
        if (storedCampus !== null) {
            const campusData: PartialCampus = JSON.parse(storedCampus);
            return {
                $id: campusData.$id,
                name: campusData.name,
                $collectionId: '', // Provide default or fetch from somewhere
                $databaseId: '', // Provide default or fetch from somewhere
                $createdAt: '', // Provide default or fetch from somewhere
                $updatedAt: '', // Provide default or fetch from somewhere
                $permissions: [] // Provide default or fetch from somewhere
            } as Models.Document;
        }
    } catch (error) {
        console.error('Error fetching campus from async storage:', error);
    }
    return null;
};

const fetchCampusFromAppwrite = async (user?: Models.Document) => {
    try {
        const campus = user?.campus;

        if (campus) {
            return campus;
        }
    } catch (error) {
        console.log("Found no campus in Appwrite", error);
        return null;
    }

    return null;
};
