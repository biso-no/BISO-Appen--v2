import React, { useEffect, useState } from 'react';
import { Button, Text, YStack, Input, H6, YGroup, Label, Checkbox, XStack, ScrollView } from 'tamagui';
import { FileUpload } from '@/lib/file-upload';
import { useAuth } from '@/components/context/auth-provider';
import { Check as CheckIcon } from '@tamagui/lucide-icons';
import CampusSelector from '@/components/SelectCampus';
import { MyStack } from '@/components/ui/MyStack';
import DepartmentSelector from '@/components/SelectDepartments';
import { createDocument, updateDocument } from '@/lib/appwrite';

export function MultiStepForm() {
    const { data, profile, isLoading, updateUserPrefs } = useAuth();

    const isRemembered = data?.prefs?.expenseRememberMe || false;

    const [currentStep, setCurrentStep] = useState(isRemembered ? 2 : 1);
    const [rememberMe, setRememberMe] = useState(isRemembered);
    const [expenseId, setExpenseId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: data?.name || "",
        email: data?.email || "",
        phone: profile?.phone || "",
        address: profile?.address || "",
        city: profile?.city || "",
        zipCode: profile?.zip || "",
        bankAccount: profile?.bank_account || "",
        campus: profile?.campus || "",
        department: profile?.departments[0] || "",
        attachments: [],
        description: ""
    });

    useEffect(() => {
        if (isRemembered) {
            setCurrentStep(2);
        }
    }, [isRemembered]);

    const handleNextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(prevStep => prevStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prevStep => prevStep - 1);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prevData => ({
            ...prevData,
            [field]: value,
        }));
    };

    const handleCampusChange = (campus: string) => {
        setFormData(prevData => ({
            ...prevData,
            campus,
            department: '' // Reset department when campus changes
        }));
    };

    const handleDepartmentChange = (department: string) => {
        setFormData(prevData => ({
            ...prevData,
            department
        }));
    };

    if (isLoading || !data) {
        return <Text>Loading...</Text>;
    }

    return (
        <MyStack space="$4" padding="$4">
            {currentStep === 1 && (
                <ScrollView>
                    <H6 fontWeight="bold">Are the details correct?</H6>
                    <YGroup>
                        <YGroup.Item>
                        <Label>Name</Label>
                        <Input 
                            placeholder="Name" 
                            onChangeText={(value) => handleInputChange('name', value)} 
                            value={formData.name}
                            disabled 
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <Label>Email</Label>
                        <Input 
                            placeholder="Email" 
                            keyboardType='email-address' 
                            onChangeText={(value) => handleInputChange('email', value)} 
                            value={formData.email}
                            disabled
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <Label>Phone</Label>
                        <Input 
                            placeholder="Phone" 
                            keyboardType='phone-pad' 
                            onChangeText={(value) => handleInputChange('phone', value)} 
                            value={formData.phone} 
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <Label>Address</Label>
                        <Input 
                            placeholder="Address" 
                            onChangeText={(value) => handleInputChange('address', value)} 
                            value={formData.address} 
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <Label>City</Label>
                        <Input 
                            placeholder="City" 
                            onChangeText={(value) => handleInputChange('city', value)} 
                            value={formData.city} 
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <Label>Zip Code</Label>
                        <Input 
                            placeholder="Zip Code" 
                            onChangeText={(value) => handleInputChange('zipCode', value)} 
                            value={formData.zipCode} 
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <Label>Bank Account</Label>
                        <Input
                            placeholder="Bank Account"
                            onChangeText={(value) => handleInputChange('bankAccount', value)}
                            value={formData.bankAccount}
                        />
                    </YGroup.Item>
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
                </ScrollView>
            )}

            {currentStep === 2 && (
                <YStack>
                <YGroup>
                    <YGroup.Item>
                    <Label>Campus</Label>
                    <CampusSelector 
                        onSelect={(value) => handleCampusChange(value ?? 'national')} 
                        campus={formData.campus} 
                    />
                    </YGroup.Item>
                    {formData.campus && (
                        <YGroup.Item>
                            <Label>Department</Label>
                        <DepartmentSelector 
                            onSelect={(value) => handleDepartmentChange(value[0] ?? 'undefined')} 
                            campus={formData.campus} 
                        />
                        </YGroup.Item>
                    )}
                </YGroup>
                </YStack>
            )}

            {currentStep === 3 && expenseId && (
                <>
                    <FileUpload bucketId='expense_attachments' expenseId={expenseId} />
                </>
            )}

            {currentStep === 4 && (
                <>
                    <Input 
                        placeholder="Description of the Expense" 
                        onChangeText={(value) => setFormData(prevData => ({
                            ...prevData,
                            description: value
                        }))} 
                        value={formData.description}
                    />
                </>
            )}

            {currentStep > 4 && (
                <>
                    <Text>All steps completed - Review and Submit</Text>
                    <Button onPress={() => setCurrentStep(1)}>Start Over</Button>
                </>
            )}

            {currentStep <= 4 && (
                <XStack space="$4">
                    {currentStep > 1 && <Button onPress={handlePrevStep}>Back</Button>}
                    <Button onPress={() => {
                        if (currentStep === 1 || currentStep === 2) {
                            if (currentStep === 1) {
                            updateDocument('user', data.$id, {
                                name: formData.name,
                                phone: formData.phone,
                                address: formData.address,
                                city: formData.city,
                                zip: formData.zipCode,
                                bank_account: formData.bankAccount,
                            });
                            }
                            if (!expenseId) { 
                                createDocument('expense', {
                                    name: formData.name,
                                    email: formData.email,
                                    phone: formData.phone,
                                    address: formData.address,
                                    city: formData.city,
                                    zip: formData.zipCode,
                                    bankAccount: formData.bankAccount,
                                }).then((response) => {
                                    setExpenseId(response.$id);
                                })
                            }
                        }
                        handleNextStep();
                    }}>
                        {currentStep === 4 ? 'Submit' : 'Next'}
                    </Button>
                </XStack>
            )}
        </MyStack>
    );
}
