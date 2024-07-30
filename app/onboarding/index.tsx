import { H1, YStack, Text, H5 } from 'tamagui';
import React, { useState } from 'react';
import { useAuth } from '@/components/context/auth-provider';
import { MultiStepForm, Step } from '@/components/ui/multi-step-form'; // Assuming the Stepper component is in this path
import { Step1 } from '@/components/onboarding/step1';
import { Step2 } from '@/components/onboarding/step2';
import { Step3 } from '@/components/onboarding/step3';
import { Step4 } from '@/components/onboarding/step4';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MyStack } from '@/components/ui/MyStack';
import { useCampus } from '@/lib/hooks/useCampus';

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

  const router = useRouter();

  const { campus } = useCampus();

  const handleUpdateName = async (name: string) => {

    console.log("Updating profile with name: ", name);
    try {
      const profile = await updateProfile({ name });
      updateName(name);
      console.log("Profile updated successfully");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (field: string, value: any) => {
    if (documentId && field !== 'campus') {
      try {
        await updateProfile({ [field]: value });
      } catch (err) {
        console.error(err);
      }
    } else if (field === 'campus') {
      updateUserPrefs(field, value);
    }
  };

  const steps = [
    {
      label: 'Welcome',
      content: (
        <H1>{name ? `Hi, ${name.split(' ')[0]}!` : 'Welcome!'}</H1>
      )
    },
    {
      label: 'What is your name?',
      content: (
        <Step1 name={name} setName={setName} />
      ),
      onNext: () => {
        handleUpdateName(name);
      },
    },
    {
      label: 'Select one or more departments to follow',
      content: (
          <Step2 />
      )
    },
    {
      label: 'Address Details',
      content: (
        <Step4 />
      ),
    }
  ] as Step[];

  const handleSubmit = async () => {
    handleUpdate('phone', phone);
    handleUpdate('address', address);
    handleUpdate('city', city);
    handleUpdate('zip', zipCode);
    router.push('/profile');
  };

  return (
    <MyStack justifyContent="center" alignItems="center" padding="$4" minHeight="100vh">
      <MultiStepForm steps={steps} onSubmit={handleSubmit} />
    </MyStack>
  );
}
