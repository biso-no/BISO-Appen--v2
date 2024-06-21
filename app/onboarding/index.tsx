import { H1, Text, View, YStack, Button, XStack, Label, Switch } from 'tamagui';
import React, { useState } from 'react';
import { FormCard } from '@/components/auth/layout';
import { Input } from '@/components/auth/input';
import { useAuth } from '@/components/context/auth-provider';
import { createDocument, updateDocument } from '@/lib/appwrite';
import CampusSelector from '@/components/SelectCampus';
import DepartmentSelector from '@/components/SelectDepartments';
import { MotiView } from 'moti';
import { useLocalSearchParams } from 'expo-router';
import { Step1 } from '@/components/onboarding/step1';
import { Step2 } from '@/components/onboarding/step2';
import { Step3 } from '@/components/onboarding/step3';
import { Step4 } from '@/components/onboarding/step4';

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

    const [campus, setCampus] = useState<Campus | null>(null);

    const [step, setStep] = useState(Number(params.initialStep) || 1);
    const [documentId, setDocumentId] = useState<string | null>(null);

    const handleNext = async () => {
        if (step === 1) {
            try {
                handleNextStep();
            } catch (err) {
                console.error(err);
            }
        } else {
            handleNextStep();
        }
    };

    const handleUpdateName = async (name: string) => {
        const result = await createDocument('user', {
            name,
        }, data?.$id);
        setDocumentId(result.$id);
        updateName(name);
    };

    const handleNextStep = () => {
        setStep(step + 1);
    };

    const handlePrev = () => {
        setStep(step - 1);
    };


    const handleCampusChange = (campus: string | null) => {
        setPreferences({ ...preferences, campus: campus ? (campus as Campus) : Campus.Oslo });

        if (campus) {
            setCampus(campus as Campus);
        }
    };

    const handleFeaturesChange = (features: string[]) => {
        setPreferences({ ...preferences, features });
    };

    const handleStudentIDChange = (studentID: string) => {
        setPreferences({ ...preferences, studentID });
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

    const firstName = name.split(' ')[0];

    return (
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" minHeight="100vh">
            <FormCard>
                <YStack flex={1} justifyContent="center" alignItems="stretch" width="100%" gap="$4">
                    <H1>{name ? `Hi, ${firstName}!` : 'Welcome!'}</H1>
                        <Step1 step={step} name={name} setName={setName} />
                        <Step2 step={step} />
                        <Step3 step={step} campus='bergen' />
                        <Step4 step={step} />

                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: step === 4 ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                        style={{ display: step === 4 ? 'flex' : 'none' }}
                    >
                        <View>
                            <Input size="$4">
                                <Input.Label htmlFor="studentID">Student ID</Input.Label>
                                <Input.Box>
                                    <Input.Area
                                        id="studentID"
                                        placeholder="Enter your student ID"
                                        keyboardType='numeric'
                                        value={preferences.studentID}
                                        onChangeText={handleStudentIDChange}
                                    />
                                </Input.Box>
                            </Input>
                            <Input size="$4">
                                <Input.Label htmlFor="features">Features</Input.Label>
                                <Input.Box>
                                    <Input.Area
                                        id="features"
                                        placeholder="Enter features you are interested in"
                                        value={preferences.features.join(', ')}
                                        onChangeText={(text) =>
                                            handleFeaturesChange(text.split(',').map((f) => f.trim()))
                                        }
                                    />
                                </Input.Box>
                            </Input>
                        </View>
                    </MotiView>
{/*
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: step === 5 ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                        style={{ display: step === 5 ? 'flex' : 'none' }}
                    >
                        <View>
                            <Label>
                                <Text>Are you a volunteer?</Text>
                                <Switch
                                    checked={preferences.isVolunteer}
                                    onCheckedChange={handleVolunteerChange}
                                />
                            </Label>
                            {preferences.isVolunteer && (
                                <Input size="$4">
                                    <Input.Label htmlFor="department">Department</Input.Label>
                                    <Input.Box>
                                        <Input.Area
                                            id="department"
                                            placeholder="Enter your department"
                                            value={preferences.departments[0]}
                                            onChangeText={handleDepartmentChange}
                                        />
                                    </Input.Box>
                                </Input>
                            )}
                        </View>
                    </MotiView>
*/}
                </YStack>
            </FormCard>
            <XStack
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                justifyContent="space-between"
                padding="$4"
            >
                {step > 1 && <Button onPress={handlePrev}>Back</Button>}
                <Button
                    onPress={() => {
                        if (step === 1) {
                            handleUpdateName(name);
                            handleNext();
                        } else if (step === 2) {
                            handleNext();
                        } else if (step === 3) {
                            handleUpdate('phone', phone);
                            handleUpdate('address', address);
                            handleUpdate('city', city);
                            handleUpdate('zip', zipCode);
                            handleNext();
                        } else if (step === 4) {
                            handleUpdate('studentID', preferences.studentID);
                            handleUpdate('features', preferences.features);
                            handleNext();
                        } else if (step === 5) {
                            handleUpdate('isVolunteer', preferences.isVolunteer);
                           // handleUpdate('department', preferences.department);
                            // Add final submit logic here
                        }
                    }}
                >
                    {step === 5 ? 'Submit' : 'Next'}
                </Button>
            </XStack>
        </YStack>
    );
}
