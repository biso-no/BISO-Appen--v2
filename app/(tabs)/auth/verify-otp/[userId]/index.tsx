import { useState, useEffect, useRef } from 'react';
// import { Link } from 'solito/link' (assuming not needed for this component)
import {
  AnimatePresence,
  Button,
  H1,
  Spinner,
  Theme,
  View,
  Text
} from 'tamagui';
import { FormCard } from '@/components/auth/layout';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { OTPInput } from '@/components/ui/otp-input';


/** ------ EXAMPLE ------ */
export default function SignInScreen() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState(''); // For error handling


  const router = useRouter();

  const { userId } = useLocalSearchParams();

  useEffect(() => {
    if (userId) {
      console.log('User ID:', userId);
    }
  }, [userId]);
  


  // Clear error message after a short delay if sign-in fails
  useEffect(() => {
    if (status === 'idle' && errorMessage) {
      const timeoutId = setTimeout(() => setErrorMessage(''), 3000); // Clear error after 3 seconds
      return () => clearTimeout(timeoutId); // Cleanup function to prevent memory leaks
    }
  }, [status, errorMessage]); // Re-run effect on status or error message change


  if (!userId) {
    throw new Error('Missing User ID. Contact System Admin if the error persists.');
  }

  return (
    <FormCard>
      <View
        flexDirection="column"
        alignItems="stretch"
        minWidth="100%"
        maxWidth="100%"
        gap="$4"
        $gtSm={{
          width: 400,
        }}
      >
        <H1
          alignSelf="center"
          size="$8"
          $xs={{
            size: '$7',
          }}
        >
          Sign in to your account
        </H1>
        <View flexDirection="column" gap="$3">
          <View flexDirection="column" gap="$1">
          </View>
        </View>
        {errorMessage && (
          <View marginTop="$2">
            <Text color="$negative">
              {errorMessage}
            </Text>
          </View>
        )}
      </View>
    </FormCard>
  );
}
