import { H1, YStack } from 'tamagui';
import React, { useState } from 'react';
import { FormCard } from '@/components/auth/layout';
import { useAuth } from '@/components/context/auth-provider';
import { createDocument, updateDocument } from '@/lib/appwrite';
import { Steps } from '@/components/ui/stepper';
import { Step1 } from '@/components/onboarding/step1';
import { Step2 } from '@/components/onboarding/step2';
import { Step3 } from '@/components/onboarding/step3';
import { Step4 } from '@/components/onboarding/step4';
import { useLocalSearchParams } from 'expo-router';

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
  const { data, profile, isLoading, error, updateName, updateUserPrefs } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [documentId, setDocumentId] = useState<string | null>(null);

  const handleUpdateName = async (name: string) => {
    if (!data) {
      return;
    }
    const result = await updateDocument('user', data.$id, { name });
    setDocumentId(result.$id);
    updateName(name);
  };

  const handleUpdate = async (field: string, value: any) => {
    if (documentId && field !== 'campus') {
      try {
        await updateDocument('user', documentId, { [field]: value });
      } catch (err) {
        console.error(err);
      }
    } else if (field === 'campus') {
      updateUserPrefs(field, value);
    }
  };

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" minHeight="100vh">
      <FormCard>
        <YStack flex={1} justifyContent="center" alignItems="stretch" width="100%" gap="$4">
          <H1>{name ? `Hi, ${name.split(' ')[0]}!` : 'Welcome!'}</H1>
          <Steps>
            <Steps.Step onNext={() => handleUpdateName(name)}>
              <Step1 onNext={() => handleUpdateName(name)} />
            </Steps.Step>
            <Steps.Step>
              <Step2 />
            </Steps.Step>
            <Steps.Step onNext={() => {
              handleUpdate('phone', phone);
              handleUpdate('address', address);
              handleUpdate('city', city);
              handleUpdate('zip', zipCode);
            }}>
              <Step3 campus='bergen' />
            </Steps.Step>
            <Steps.Step onNext={() => {
              handleUpdate('studentID', preferences.studentID);
              handleUpdate('features', preferences.features);
            }}>
              <Step4 />
            </Steps.Step>
          </Steps>
        </YStack>
      </FormCard>
    </YStack>
  );
}
