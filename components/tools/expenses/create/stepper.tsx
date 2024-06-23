import React, { useEffect, useState } from 'react';
import { Button, Text, YStack, Input, H6, YGroup, Label, Checkbox, XStack } from 'tamagui';
import { FileUpload } from '@/lib/file-upload';
import { useAuth } from '@/components/context/auth-provider';
import { Check as CheckIcon } from '@tamagui/lucide-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateDocument } from '@/lib/appwrite';

export function MultiStepForm() {
    const { data, isLoading, updateUserPrefs } = useAuth();

    const isRemembered = data?.prefs?.expenseRememberMe || false;

    const [currentStep, setCurrentStep] = useState(1);
    const [rememberMe, setRememberMe] = useState(isRemembered);
    const [formData, setFormData] = useState({
        contactDetails: {
            name: data?.name || "",
            email: data?.email || "",
            phone: data?.phone || "",
        },
        campus: "",
        department: "",
        attachments: [],
        description: ""
    });
    const [completedSteps, setCompletedSteps] = useState(new Set<number>());

    const saveSteps = async (steps: Set<number>) => {
        try {
            const stepsArray = Array.from(steps);
            await AsyncStorage.setItem('completedSteps', JSON.stringify(stepsArray));
        } catch (error) {
            console.error('Failed to save steps', error);
        }
    };
    
    const loadSteps = async () => {
        try {
            const stepsJson = await AsyncStorage.getItem('completedSteps');
            if (stepsJson !== null) {
                const stepsArray = JSON.parse(stepsJson) as number[];
                setCompletedSteps(new Set<number>(stepsArray));
            }
        } catch (error) {
            console.error('Failed to load steps', error);
        }
    };
    
    useEffect(() => {
        loadSteps();
    }, []);

    useEffect(() => {
        saveSteps(completedSteps);
    }, [completedSteps]);

    useEffect(() => {
        if (isRemembered) {
            let startStep = 1;
            while (completedSteps.has(startStep)) {
                startStep++;
            }
            setCurrentStep(startStep);
        } else {
            setCurrentStep(1);
        }
    }, [isRemembered, completedSteps]);

    const nextStep = () => {
        if (rememberMe) {
            completedSteps.add(currentStep);
            setCompletedSteps(new Set(completedSteps));
        }
        let nextStep = currentStep + 1;
        while (completedSteps.has(nextStep)) {
            nextStep++;
        }
        setCurrentStep(nextStep);
    };

    const prevStep = () => {
        let prevStep = currentStep - 1;
        while (completedSteps.has(prevStep) && prevStep > 1) {
            prevStep--;
        }
        setCurrentStep(prevStep);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    if (isLoading || !data) {
        return <Text>Loading...</Text>;
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <YStack>
                        <H6 fontWeight="bold">Are the details correct?</H6>
                        <YGroup>
                            <Label>Name</Label>
                            <Input placeholder="Name" onChangeText={(value) => handleInputChange('contactDetails.name', value)} value={formData.contactDetails.name} />
                        </YGroup>
                        <YGroup>
                            <Label>Email</Label>
                            <Input placeholder="Email" keyboardType='email-address' onChangeText={(value) => handleInputChange('contactDetails.email', value)} value={formData.contactDetails.email} />
                        </YGroup>
                        <YGroup>
                            <Label>Phone</Label>
                            <Input placeholder="Phone" keyboardType='phone-pad' onChangeText={(value) => handleInputChange('contactDetails.phone', value)} value={formData.contactDetails.phone} />
                        </YGroup>
                        <XStack width={300} alignItems="center" space="$4">
                            <Checkbox 
                                id="remember-me" 
                                size="$4" 
                                checked={rememberMe}
                                onCheckedChange={(checked) => {
                                    if (checked === true || checked === false) {
                                        setRememberMe(checked);
                                        updateUserPrefs('expenseRememberMe', checked);
                                    }
                                }}>
                                <Checkbox.Indicator>
                                    <CheckIcon />
                                </Checkbox.Indicator>
                            </Checkbox>
                            <Label size="$4" htmlFor="remember-me">
                                Skip this step in the future
                            </Label>
                        </XStack>
                        <Button onPress={() => {
                            nextStep();
                            updateDocument('users', data.$id, formData.contactDetails);
                        }}>Next</Button>
                    </YStack>
                );
            case 2:
                return (
                    <YStack>
                        <Input placeholder="Campus" onChangeText={(value) => handleInputChange('campus', value)} />
                        <Input placeholder="Department" onChangeText={(value) => handleInputChange('department', value)} />
                        <Button onPress={nextStep}>Next</Button>
                    </YStack>
                );
            case 3:
                return (
                    <YStack>
                        <FileUpload bucketId='expenses' />
                        <Button onPress={nextStep}>Next</Button>
                    </YStack>
                );
            case 4:
                return (
                    <YStack>
                        <Input placeholder="Description of the Expense" onChangeText={(value) => handleInputChange('description', value)} />
                        <Button onPress={nextStep}>Submit</Button>
                    </YStack>
                );
            default:
                return (
                    <YStack>
                        <Text>All steps completed - Review and Submit</Text>
                        <Button onPress={() => setCurrentStep(1)}>Start Over</Button>
                    </YStack>
                );
        }
    };

    return (
        <YStack space="$4" padding="$4">
            <Text>Step {currentStep} of 4</Text>
            {renderStep()}
            {currentStep > 1 && <Button onPress={prevStep}>Back</Button>}
        </YStack>
    );
};
