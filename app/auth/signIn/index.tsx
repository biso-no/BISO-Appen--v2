import { useState, useEffect } from 'react';
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
import { Input } from '@/components/auth/input';
import { signIn } from '@/lib/appwrite';
import { useRouter } from 'expo-router';

/** ------ EXAMPLE ------ */
export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState(''); // For error handling

  const router = useRouter();

  const handleSignIn = async () => {
    setStatus('loading');
    setErrorMessage(''); // Clear any previous errors

    try {
      const userId = await signIn(email);
      setStatus('success');
      // Handle successful sign-in here (e.g., navigate to another screen)
      console.log('Sign in successful! User ID:', userId);
      router.push('/auth/verify-otp/' + userId);
    } catch (error) {
      setStatus('idle');
      setErrorMessage(error.message || 'An error occurred. Please try again.'); // Handle errors gracefully
    }
  };

  // Clear error message after a short delay if sign-in fails
  useEffect(() => {
    if (status === 'idle' && errorMessage) {
      const timeoutId = setTimeout(() => setErrorMessage(''), 3000); // Clear error after 3 seconds
      return () => clearTimeout(timeoutId); // Cleanup function to prevent memory leaks
    }
  }, [status, errorMessage]); // Re-run effect on status or error message change

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
            <Input size="$4">
              <Input.Label htmlFor="email">Email</Input.Label>
              <Input.Box>
                <Input.Area
                  id="email"
                  placeholder="email@example.com"
                  value={email}
                  onChangeText={setEmail}
                />
              </Input.Box>
            </Input>
          </View>
        </View>
        <Theme inverse>
          <Button
            disabled={status === 'loading'} // Disable button during loading
            onPress={handleSignIn}
            width="100%"
            iconAfter={
              <AnimatePresence>
                {status === 'loading' && (
                  <Spinner
                    color="$color"
                    key="loading-spinner"
                    opacity={1}
                    scale={1}
                    animation="quick"
                    position="absolute"
                    left="60%"
                    enterStyle={{
                      opacity: 0,
                      scale: 0.5,
                    }}
                    exitStyle={{
                      opacity: 0,
                      scale: 0.5,
                    }}
                  />
                )}
              </AnimatePresence>
            }
          >
            <Button.Text>Sign In</Button.Text>
          </Button>
        </Theme>
        {errorMessage && (
          <View mt="$2">
            <Text color="$negative" variant="body">
              {errorMessage}
            </Text>
          </View>
        )}
      </View>
    </FormCard>
  );
}
