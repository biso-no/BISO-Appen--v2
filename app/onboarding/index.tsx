import { H1, Text, View, YStack, Button, XStack, Label, Switch } from 'tamagui';
import React, { useState } from 'react';
import { FormCard } from '@/components/auth/layout';
import { Input } from '@/components/auth/input';
import { useAppwriteAccount } from '@/components/context/auth-context';
import { createDocument, updateDocument } from '@/lib/appwrite';
import CampusSelector from '@/components/SelectCampus';
import DepartmentSelector from '@/components/SelectDepartments';
import { MotiView } from 'moti';
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
    const { data, profile, isLoading, error, updateName, updatePrefs } = useAppwriteAccount();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [bankAccount, setBankAccount] = useState('');

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

    const handleNextStep = () => {
        setStep(step + 1);
    };

    const handlePrev = () => {
        setStep(step - 1);
    };

    const handleNameChange = (name: string) => {
        setName(name);
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

    const handleVolunteerChange = (isVolunteer: boolean) => {
        setPreferences({ ...preferences, isVolunteer });
    };

    const handleDepartmentChange = (departments: string[]) => {
        setPreferences({ ...preferences, departments });
    };

    const handleUpdate = async (field: string, value: any) => {
        if (documentId && field !== 'campus') {
            try {
                await updateDocument('user', documentId, { [field]: value });
            } catch (err) {
                console.error(err);
            }
        } else if (field === 'campus') {
            updatePrefs({ [field]: value });
        }
    };

    return (
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4" minHeight="100vh">
            <FormCard>
                <YStack flex={1} justifyContent="center" alignItems="stretch" width="100%" gap="$4">
                    <H1>Welcome to BISO</H1>
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: step === 1 ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                        style={{ display: step === 1 ? 'flex' : 'none' }}
                    >
                        <View>
                            <Input size="$4">
                                <Input.Label htmlFor="name">Name</Input.Label>
                                <Input.Box>
                                    <Input.Area
                                        id="name"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChangeText={handleNameChange}
                                    />
                                </Input.Box>
                            </Input>
                        </View>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: step === 2 ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                        style={{ display: step === 2 ? 'flex' : 'none' }}
                    >
                        <View>
                            <CampusSelector onSelect={handleCampusChange} />
                        </View>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: step === 3 ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                        style={{ display: step === 3 ? 'flex' : 'none' }}
                    >
                        <View>
                            {campus && <DepartmentSelector campus={campus} onSelect={handleDepartmentChange} />}
                        </View>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: step === 3 ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                        style={{ display: step === 3 ? 'flex' : 'none' }}
                    >
                        <View>
                            <Input size="$4">
                                <Input.Label htmlFor="phone">Phone</Input.Label>
                                <Input.Box>
                                    <Input.Area
                                        id="phone"
                                        placeholder="Enter your phone number"
                                        value={phone}
                                        keyboardType='phone-pad'
                                        onChangeText={setPhone}
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
                                    />
                                </Input.Box>
                            </Input>
                        </View>
                    </MotiView>

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
                            handleNext();
                        } else if (step === 2) {
                            handleUpdate('campus', preferences.campus);
                            handleNext();
                        } else if (step === 3) {
                            handleUpdate('phone', phone);
                            handleUpdate('address', address);
                            handleUpdate('city', city);
                            handleUpdate('zipCode', zipCode);
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
