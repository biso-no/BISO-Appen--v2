import { Button, View, YStack } from 'tamagui';
import React, { useState } from 'react';
import { Input } from '@/components/auth/input';
import { MotiView } from 'moti';
import { databases, updateDocument } from '@/lib/appwrite';
import { useAuth } from '../context/auth-provider';

interface Step4Props {
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  setPhone?: (phone: string) => void;
  setAddress?: (address: string) => void;
  setCity?: (city: string) => void;
  setZipCode?: (zipCode: string) => void;
}

export function Step4({ phone, address, city, zipCode, setPhone, setAddress, setCity, setZipCode }: Step4Props) {

  const { data, profile } = useAuth();

  const updateProfile = async (profileData: { phone?: string, address?: string, city?: string, zip?: string }) => {
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      ...profileData,
    };

    try {
      await updateDocument('user', profile.$id, updatedProfile);
      console.log("Profile updated successfully");
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <YStack space="$4" width="$16">
        <Input size="$4">
          <Input.Label htmlFor="phone">Phone</Input.Label>
          <Input.Box>
            <Input.Area
              id="phone (Op"
              placeholder="Enter your phone number"
              value={phone}
              keyboardType="phone-pad"
              onChangeText={setPhone}
              color="$color"
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
              color="$color"
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
              color="$color"
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
              color="$color"
            />
          </Input.Box>
        </Input>
      </YStack>
    </MotiView>
  );
};
