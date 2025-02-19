import React, { RefObject, useEffect, useRef, useState } from 'react';
import { Button, Input, Text, YStack, XGroup } from 'tamagui';
import { signIn, triggerFunction, verifyOtp } from '@/lib/appwrite';
import { useRouter } from 'expo-router';
import { OTPInput as OTP } from '@/components/ui/otp';
import { TextInput } from 'react-native';
import { MyStack } from '@/components/ui/MyStack';
import { MotiView } from 'moti';
import { useAuth } from '@/components/context/auth-provider';

// Define at the top of your file
const OTP_LENGTH = 6;


export default function LoginScreen() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [errorMessages, setErrorMessages] = useState<string[]>();

  const { refetchUser, profile, data } = useAuth();

  const refs: RefObject<TextInput>[] = Array.from({ length: OTP_LENGTH }, () => useRef<TextInput>(null));
  const { push } = useRouter();

  const handleEmailSubmit = async () => {
    // Here you would typically send the OTP to the user's email
    const response = await signIn(email);
    if (response) {
      setStep(1);
      setUserId(response);
    }
  }

  const handleGoBack = async () => {
    setStep(0);
  }

  const handleOtpSubmit = async (code: string) => {
    if (!code) {
      setErrorMessages(["Please enter a valid OTP."]);
      return;
    }
  
    try {
      const response = await verifyOtp(userId, code);
      if (response) {
        console.log("User successfully verified");
        push('/')
        refetchUser();
      } else {
        console.log("User not verified");
      }
    } catch (error) {
      console.error("Error during OTP submission: ", error);
      setErrorMessages(["An unexpected error occurred. Please try again."]);
    }
  };
  
  //If 6 digits are entered, attempt to submit the OTP
  useEffect(() => {
    if (otp.length === OTP_LENGTH) {
      handleOtpSubmit(otp);
    }
  }, [otp]);

  return (
    <MyStack flex={1} justifyContent="center" alignItems="center" padding="$4">
          <MotiView
            key="email"
            from={{ opacity: 0 }}
            animate={{ opacity: step === 0 ? 1 : 0 }}
            exit={{ opacity: 0 }}
            style={{ display: step === 0 ? "flex" : "none" }}
          >
            <Text fontSize="$4" marginBottom="$2">Enter your email address</Text>
            <Input
              placeholder="Email"
              backgroundColor={"transparent"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              marginBottom="$4"
            />
            <Button onPress={handleEmailSubmit}>Send code</Button>
          </MotiView>
                  <MotiView
                  key="otp"
                  from={{ opacity: 0 }}
                  animate={{ opacity: step === 1 ? 1 : 0 }}
                  exit={{ opacity: 0 }}
                  style={{ display: step === 1 ? "flex" : "none" }}
              >
                <YStack gap="$4" maxWidth="100%">
            <Text fontSize="$4" marginBottom="$2">An email has been sent to {email}</Text>
              <Input
                placeholder="Enter OTP"
                backgroundColor={"transparent"}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                autoCapitalize="none"
                marginBottom="$4"
                size="$4"
                ref={refs[0]}
                />
             <XGroup justifyContent='center' gap="$4">
             <Button onPress={handleGoBack}>
              Back
             </Button>
            </XGroup>
          </YStack>
          </MotiView>
    </MyStack>
  );
}
