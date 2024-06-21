import { View } from 'tamagui';
import React from 'react';
import CampusSelector from '@/components/SelectCampus';
import { MotiView } from 'moti';
import { useAuth } from '../context/auth-provider';

interface Step {
    step: number
}

export function Step2({ step }: Step) {

    const { updateUserPrefs } = useAuth();

    const handleCampusChange = (campus: string | null) => {
        if (campus) {
            updateUserPrefs('campus', campus);
        }
    }

    return (
        <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: step === 2 ? 1 : 0 }}
        exit={{ opacity: 0 }}
        style={{ display: step === 2 ? 'flex' : 'none' }}
    >
        <View>
            <CampusSelector onSelect={handleCampusChange} />
        </View>
    </MotiView>
    )   

}