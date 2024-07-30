import React, { RefObject, useRef, useState } from 'react';
import { Button, Input, Text, YStack, XGroup } from 'tamagui';
import { signIn, triggerFunction, verifyOtp } from '@/lib/appwrite';
import { useRouter } from 'expo-router';
import { OTPInput as OTP } from '@/components/ui/otp';
import { TextInput } from 'react-native';
import { MyStack } from '@/components/ui/MyStack';
import { MotiView } from 'moti';
import { useAuth } from '@/components/context/auth-provider';

export default function LoginScreen() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [codes, setCodes] = useState<string[] | undefined>(Array(6).fill(""));
  const [errorMessages, setErrorMessages] = useState<string[]>();

  const { refetchUser, profile, data } = useAuth();

  const refs: RefObject<TextInput>[] = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

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

  const handleOtpSubmit = async () => {
    const otp = codes?.join("");
    if (!otp) {
      setErrorMessages(["Please enter a valid OTP."]);
      return;
    }
  
    try {
      const response = await verifyOtp(userId, otp);
      if (response.$id) {
        const execution = await triggerFunction({
          functionId: 'create_user_doc',
          data: JSON.stringify({
            email: email
          }),
          async: false,
        });
  
        const responseBody = execution.responseBody
        const bodyToJson = JSON.parse(responseBody)
  
        if (bodyToJson.status === "ok") {
          if (bodyToJson.exists === true) {
            console.log("Routing to /");
            push('/');
          } else {
            console.log("Routing to /onboarding");
            push('/onboarding');
          }
        } else {
          setErrorMessages(["An error occurred. Please try again."]);
        }
      }
    } catch (error) {
      console.error("Error during OTP submission: ", error);
      setErrorMessages(["An unexpected error occurred. Please try again."]);
    }
  };


  const onChangeCode = (text: string, index: number) => {
    if (text.length > 1) {
      setErrorMessages(undefined);
      const newCodes = text.split("");
      setCodes(newCodes);
      refs[5]!.current?.focus();
      return;
    }
    setErrorMessages(undefined);
    const newCodes = [...codes!];
    newCodes[index] = text;
    setCodes(newCodes);
    if (text !== "" && index < 5) {
      refs[index + 1]!.current?.focus();
    }
  };

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
                <YStack space="$4" maxWidth="100%">
            <Text fontSize="$4" marginBottom="$2">An email has been sent to {email}</Text>
            <OTP 
            onChangeCode={onChangeCode}
            codes={codes!}
            refs={refs}
            errorMessages={errorMessages}
             />
             <XGroup justifyContent='center' space="$4">
             <Button onPress={handleGoBack}>
              Back
             </Button>
            <Button onPress={handleOtpSubmit}>Sign in</Button>
            </XGroup>
          </YStack>
          </MotiView>
    </MyStack>
  );
}
