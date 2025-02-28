import { H1, YStack, Text, H5, Theme, useTheme } from 'tamagui';
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/context/auth-provider';
import { MultiStepForm, Step } from '@/components/ui/multi-step-form'; // Assuming the Stepper component is in this path
import { Step1 } from '@/components/onboarding/step1';
import { Step2 } from '@/components/onboarding/step2';
import { Step3 } from '@/components/onboarding/step3';
import { Step4 } from '@/components/onboarding/step4';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MyStack } from '@/components/ui/MyStack';
import { useCampus } from '@/lib/hooks/useCampus';
import { StyleSheet, Dimensions, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import ConfettiCannon from 'react-native-confetti-cannon';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PartyPopper, User, Building2, MapPin } from '@tamagui/lucide-icons';

enum Campus {
  Bergen = "bergen",
  Oslo = "oslo",
  Trondheim = "trondheim",
  Stavanger = "stavanger"
}

interface UserPreferences {
  campus?: Campus;
  features: string[];
  studentID: string;
  isVolunteer: boolean;
  departments: string[];
}

export default function Onboarding() {
  const params = useLocalSearchParams<{ initialStep: string }>();
  const [preferences, setPreferences] = useState<UserPreferences>({
    features: [],
    studentID: '',
    isVolunteer: false,
    departments: [],
  });
  const { data, profile, isLoading, error, updateName, updateUserPrefs, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [zipCode, setZipCode] = useState(profile?.zip ?? '');
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<ConfettiCannon>(null);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width, height } = Dimensions.get('window');

  const router = useRouter();

  const { campus } = useCampus();

  const handleUpdateName = async (name: string) => {
    setName(name);
  };

  const handleUpdate = async (field: string, value: any) => {
    // Store values locally without making API calls
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'phone':
        setPhone(value);
        break;
      case 'address':
        setAddress(value);
        break;
      case 'city':
        setCity(value);
        break;
      case 'zipCode':
        setZipCode(value);
        break;
      case 'campus':
        updateUserPrefs(field, value);
        break;
    }
  };

  const steps = [
    {
      label: 'What is your name?',
      content: (
        <Step1 name={name} setName={setName} />
      ),
      onNext: () => {
        handleUpdateName(name);
      },
      icon: <User size={24} color="$primary" />
    },
    {
      label: 'Select one or more departments to follow',
      content: (
        <Step2 />
      ),
      icon: <Building2 size={24} color="$primary" />
    },
    {
      label: 'Address Details',
      content: (
        <Step4 
          address={address} 
          setAddress={setAddress} 
          city={city} 
          setCity={setCity} 
          zipCode={zipCode} 
          setZipCode={setZipCode} 
          phone={phone} 
          setPhone={setPhone} 
        />
      ),
      icon: <MapPin size={24} color="$primary" />
    }
  ] as Step[];

  const handleSubmit = async () => {
    // Show confetti animation
    setShowConfetti(true);
    
    try {
      // Create/Update profile with all collected information
      const response = await updateProfile({ 
        name,
        phone, 
        address, 
        city, 
        zip: zipCode,
      });
      
      console.log('Profile created/updated successfully:', response);
      
      // Wait for animation to complete before redirecting
      setTimeout(() => {
        router.push('/profile');
      }, 2500);
    } catch (error) {
      console.error('Error creating/updating profile:', error);
      // You might want to add error handling UI here
    }
  };

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Theme name={isDark ? 'dark' : 'light'}>
        <LinearGradient
          colors={
            isDark 
              ? ['#1a1a2e', '#16213e', '#1a1a2e'] 
              : ['#f0f4ff', '#e6eeff', '#f0f4ff']
          }
          style={styles.background}
        >
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 1000 }}
            style={styles.container}
          >
            <YStack 
              justifyContent="flex-start" 
              alignItems="center" 
              padding="$3"
              paddingTop={insets.top + 8}
              paddingBottom={Math.max(insets.bottom, 16)}
              flex={1}
              gap="$2"
            >
              <H1 
                color="$primary" 
                textAlign="center"
                animation="quick"
                enterStyle={{ scale: 0.9, opacity: 0 }}
                fontSize={28}
                fontWeight="bold"
                marginBottom="$1"
              >
                Welcome Onboard
              </H1>
              
              <YStack flex={1} width="100%" maxWidth={600} alignSelf="center">
                <MultiStepForm steps={steps} onSubmit={handleSubmit} />
              </YStack>
              
              {showConfetti && (
                <ConfettiCannon
                  count={200}
                  origin={{ x: width / 2, y: 0 }}
                  autoStart={true}
                  fadeOut={true}
                  ref={confettiRef}
                />
              )}
            </YStack>
          </MotiView>
        </LinearGradient>
      </Theme>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
