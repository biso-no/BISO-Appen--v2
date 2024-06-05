import { View } from 'tamagui';
import React, { useState } from 'react';
import { Input } from '@/components/auth/input';
import { MotiView } from 'moti';

interface Step4Props {
    step: number;
}

export function Step4({ step }: Step4Props) {

    
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [zipCode, setZipCode] = useState('');

    return (
        <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: step === 3 ? 1 : 0 }}
        exit={{ opacity: 0 }}
        style={{ display: step === 3 ? 'flex' : 'none' }}
    >
        <View>
            <Input size="$4">
                <Input.Label htmlFor="phone">Phone</Input.Label>
                <Input.Box>
                    <Input.Area
                        id="phone"
                        placeholder="Enter your phone number"
                        value={phone}
                        keyboardType='phone-pad'
                        onChangeText={setPhone}
                    />
                </Input.Box>
            </Input>
            <Input size="$4">
                <Input.Label htmlFor="address">Address</Input.Label>
                <Input.Box>
                    <Input.Area
                        id="address"
                        placeholder="Enter your address"
                        value={address}
                        onChangeText={setAddress}
                    />
                </Input.Box>
            </Input>
            <Input size="$4">
                <Input.Label htmlFor="city">City</Input.Label>
                <Input.Box>
                    <Input.Area
                        id="city"
                        placeholder="Enter your city"
                        value={city}
                        onChangeText={setCity}
                    />
                </Input.Box>
            </Input>
            <Input size="$4">
                <Input.Label htmlFor="zipCode">Zip Code</Input.Label>
                <Input.Box>
                    <Input.Area
                        id="zipCode"
                        placeholder="Enter your zip code"
                        value={zipCode}
                        onChangeText={setZipCode}
                    />
                </Input.Box>
            </Input>
        </View>
    </MotiView>
    )

}