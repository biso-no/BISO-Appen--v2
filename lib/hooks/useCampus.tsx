import React from 'react';
import * as AsyncStorage from '@react-native-async-storage/async-storage';
import { Models } from 'react-native-appwrite';
import { useCampusContext } from '@/components/context/core/campus-provider';

type PartialCampus = {
    $id: string;
    name: string;
};


// Bridge hook that uses the new implementation but keeps the old API
export const useCampus = () => {
    const { currentCampus, campuses, changeCampus } = useCampusContext();
    
    // Map campuses to the old availableCampuses format
    const availableCampuses = campuses?.map(c => ({
        id: c.$id,
        name: c.name
    })) || [
        { id: "1", name: 'Oslo' },
        { id: "2", name: 'Bergen' },
        { id: "3", name: 'Trondheim' },
        { id: "4", name: 'Stavanger' },
        { id: "5", name: 'National' },
    ];

    // Keep backward compatibility with the old interface
    const onChange = async (newCampus: Models.Document) => {
        await changeCampus(newCampus);
        try {
            const campusData: PartialCampus = {
                $id: newCampus.$id,
                name: newCampus.name
            };
            await AsyncStorage.default.setItem('campus', JSON.stringify(campusData));
        } catch (error) {
            console.error('Error saving campus to async storage:', error);
        }
    };

    return { 
        campus: currentCampus, 
        onChange, 
        availableCampuses 
    };
};

// This is now a stub for backward compatibility - the real implementation
// is in components/context/core/campus-provider.tsx
export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Just pass through to children - the real provider is added in _layout.tsx
    return <>{children}</>;
};
