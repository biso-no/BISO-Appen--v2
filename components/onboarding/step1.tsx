import { View } from 'tamagui';
import React, { useState } from 'react';
import { Input } from '@/components/auth/input';
import { MotiView } from 'moti';
import { useAppwriteAccount } from '../context/auth-context';

interface Step1Props {
    step: number;
    name: string;
    setName: (name: string) => void;
}

export function Step1({ step, name, setName }: Step1Props) {

    const handleNameChange = (name: string) => {
        setName(name);
    }

    return (
        <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: step === 1 ? 1 : 0 }}
        exit={{ opacity: 0 }}
        style={{ display: step === 1 ? 'flex' : 'none' }}
    >
        <View>
            <Input size="$4">
                <Input.Label htmlFor="name">Name</Input.Label>
                <Input.Box>
                    <Input.Area
                        id="name"
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={handleNameChange}
                    />
                </Input.Box>
            </Input>
        </View>
    </MotiView>
    )

}