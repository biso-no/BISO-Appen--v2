import { OTPInput } from '@/components/ui/otp-input';
import { AnimatedView } from '@tamagui/animations-react-native';
import React, { useState } from 'react';
import { Button, Input, Text, YStack, AnimatePresence } from 'tamagui';
import { signIn, verifyOtp } from '@/lib/appwrite';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');

  const { push } = useRouter();

  const handleEmailSubmit = async () => {
    // Here you would typically send the OTP to the user's email
    const response = await signIn(email);
    if (response) {
      setStep('otp');
      setUserId(response);
    }
  }

  const handleOtpSubmit = async () => {
    // Handle OTP submission
    const response = await verifyOtp(userId, otp);
    if (response) {
      if (response.hasProfile) {
        push('/profile');
      } else {
        push('/onboarding');
      }
    }
  }

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
      <AnimatePresence>
        {step === 'email' && (
          <AnimatedView key="email" >
            <Text fontSize="$4" marginBottom="$2">Enter your email address</Text>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              marginBottom="$4"
            />
            <Button onPress={handleEmailSubmit}>Next</Button>
          </AnimatedView>
        )}
        {step === 'otp' && (
          <AnimatedView key="otp">
            <Text fontSize="$4" marginBottom="$2">Enter the OTP sent to your email</Text>
            <OTPInput numberOfDigits={6} onChange={setOtp} />
            <Button onPress={handleOtpSubmit}>Submit</Button>
          </AnimatedView>
        )}
      </AnimatePresence>
    </YStack>
  );
}
