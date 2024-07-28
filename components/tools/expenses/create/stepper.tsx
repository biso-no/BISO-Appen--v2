import React, { useEffect, useState } from 'react'; 
import { Button, Text, YStack, Input, H6, YGroup, Label, Checkbox, XStack, ScrollView, Spinner } from 'tamagui'; 
import { FileUpload } from '@/lib/file-upload'; 
import { useAuth } from '@/components/context/auth-provider'; 
import { Check as CheckIcon } from '@tamagui/lucide-icons'; 
import CampusSelector from '@/components/SelectCampus'; 
import { MyStack } from '@/components/ui/MyStack'; 
import DepartmentSelector from '@/components/SelectDepartments'; 
import { createDocument, updateDocument, triggerFunction } from '@/lib/appwrite'; 
import { MotiView } from 'moti';
import { useDebounce } from 'use-debounce';
import OverviewScreen from './overview';
import { Switch } from '@/components/ui/switch';
import { Models } from 'react-native-appwrite';

export interface Attachment { 
    url: string; 
    description: string; 
    date: string; 
    amount: string; 
}

type FormData = {
  bank_account: string;
  campus: string;
  department: Models.Document
  expenseAttachments: Attachment[];
  description: string;
  prepayment_amount: number;
  total: number;
  status: string;
};

export function MultiStepForm() { 
    const { data, profile, isLoading } = useAuth(); 
    const [currentStep, setCurrentStep] = useState(1); 
    const [expenseId, setExpenseId] = useState<string | null>(null); 
    const [selectedCampus, setSelectedCampus] = useState<Models.Document | null | undefined>(null);
    const [forEvent, setForEvent] = useState(false);
    const [eventName, setEventName] = useState<string>("");
    const [debouncedEventName] = useDebounce(eventName, 500);
    const [showGenerateButton, setShowGenerateButton] = useState(false);
    const [formData, setFormData] = useState<FormData>({ 
        bank_account: profile?.bank_account || "", 
        campus: profile?.campus.id || "",
        department: {} as Models.Document,
        expenseAttachments: [],
        description: "", 
        prepayment_amount: 0, 
        total: 0, 
        status: "draft", 
    }); 
    const [receivedPrepayment, setReceivedPrepayment] = useState(formData.prepayment_amount > 0 ? true : false); 
    const [isProcessing, setIsProcessing] = useState(false);
 
    const handleNextStep = () => { 
        console.log('Current Step:', currentStep);
        if (currentStep < 5) { 
            setCurrentStep(prevStep => prevStep + 1); 
        } 
    }; 

    const handlePrevStep = () => { 
        console.log('Current Step:', currentStep);
        if (currentStep > 1) { 
            setCurrentStep(prevStep => prevStep - 1); 
        } 
    }; 

    const handleInputChange = (field: keyof FormData, value: string | number | Attachment[] | Models.Document) => { 
        setFormData(prevData => ({ 
            ...prevData, 
            [field]: value, 
        })); 
    }; 

    const handleCampusChange = (campus?: Models.Document | null) => { 
      console.log(campus);
        setSelectedCampus(campus);
        handleInputChange('campus', campus?.name ?? '');
        handleInputChange('department', ''); 
    }; 

    const handleDepartmentChange = (selectedDepartments: Models.Document) => {
      handleInputChange('department', selectedDepartments || null);
    };

    const handleSaveDraft = async () => { 
        if (!profile) { 
            return; 
        } 
        const newExpense = await updateDocument('user', profile.$id, { 
            expenses: [{ 
                ...formData, 
                status: 'draft', 
            }], 
        });
        setExpenseId(newExpense.$id); 
    }; 

    const handleSubmit = async () => { 
        if (!profile) { 
            return; 
        } 
        const newExpense = await updateDocument('user', profile.$id, { 
            expenses: [{ 
                ...formData, 
                status: 'pending', 
            }], 
        });
        setExpenseId(newExpense.$id); 
    };

    if (isLoading || !data || !profile) { 
        return <Text>Loading...</Text>; 
    } 

    useEffect(() => {
        if (debouncedEventName) {
            setShowGenerateButton(true);
        } else {
            setShowGenerateButton(false);
        }
    }, [debouncedEventName]);

    const handleGenerateDescription = async () => {
        setIsProcessing(true);
        const descriptions = formData.expenseAttachments.map(attachment => attachment.description).join(', ');
        const event = eventName ? `for ${eventName}` : '';

        const body = {
            descriptions: descriptions,
            event: event
        }
        const overallDescription = await triggerFunction({
            functionId: 'generate_expense_description',
            async: false,
            data: JSON.stringify(body)
        });
        if (!overallDescription) {
            setIsProcessing(false);
            return;
        }
        const responseBody = JSON.parse(overallDescription.responseBody);
        handleInputChange('description', responseBody.description);
        setIsProcessing(false);
    };

    // Whenever an attachment is added or removed, update the total
    useEffect(() => {
      if (formData.expenseAttachments.length === 0) {
        handleInputChange('total', 0);
        return;
      }
        const expenseAttachments = formData.expenseAttachments
        const total = expenseAttachments.reduce((acc, attachment) => {
            return acc + parseFloat(attachment.amount);
        }, 0);
        handleInputChange('total', total);
    }, [formData.expenseAttachments]);
    
    // If on last step, and all fields are not populated, disable the submit button.
    const submitButtonDisabled = currentStep === 5 && (
      !formData.bank_account || 
      !formData.description || 
      !formData.total || 
      !formData.expenseAttachments.length
    );
    

    return (
        <MyStack space="$4" padding="$4">
          {currentStep === 1 && (
            <ScrollView>
              <H6 fontWeight="bold">Payment Details</H6>
              <YGroup>
                <YGroup.Item>
                  <Label>Bank Account</Label>
                  <Input
                    placeholder="Bank Account"
                    onChangeText={(value) => handleInputChange('bank_account', value)}
                    value={formData.bank_account}
                  />
                </YGroup.Item>
                <YGroup.Item>
                  <Switch value={receivedPrepayment} onValueChange={() => setReceivedPrepayment(!receivedPrepayment)} label='Did you receive a prepayment?' size="$4" />
                </YGroup.Item>
                {receivedPrepayment && (
                  <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <YGroup.Item>
                  <Label>How much was prepaid?</Label>
                  <Input
                    placeholder="Prepayment Amount"
                    onChangeText={(value) => handleInputChange('prepayment_amount', value)}
                    value={formData.prepayment_amount.toString()}
                  />
                </YGroup.Item>
                </MotiView>
                )}
              </YGroup>
            </ScrollView>
          )}
    
          {currentStep === 2 && (
            <ScrollView>
            <YStack>
              <YGroup>
                <YGroup.Item>
                  <Label>Campus</Label>
                  <CampusSelector
                    onSelect={(value) => handleCampusChange(value)}
                    campus={formData.campus}
                    initialCampus={profile?.campus}
                  />
                </YGroup.Item>
                {formData.campus && (
                  <YGroup.Item>
                    <Label>Department</Label>
                    <DepartmentSelector
                    campus={selectedCampus}
                    onSelect={handleDepartmentChange}
                    selectedDepartments={formData.department ? [formData.department] : []}
                  />
                  </YGroup.Item>
                )}
              </YGroup>
            </YStack>
            </ScrollView>
          )}
    
          {currentStep === 3 && (
            <YStack>
            <FileUpload
                ocrResults={formData.expenseAttachments}
                setOcrResults={(attachments) => setFormData(prevData => ({
                    ...prevData,
                    expenseAttachments: attachments as Attachment[]
                }))}
            />

            </YStack>
          )}
    
          {currentStep === 4 && (
            <YStack>
              <YGroup space="$4">
                <YGroup.Item>
                  <Switch value={forEvent} onValueChange={() => setForEvent(!forEvent)} label='Is this expense related to a specific event?' size="$4" />
                </YGroup.Item>
                {forEvent && (
                  <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <YGroup.Item>
                      <Label>Event Name</Label>
                      <Input
                        placeholder="Event Name"
                        onChangeText={(value) => setEventName(value)}
                        value={eventName}
                      />
                    </YGroup.Item>
                  </MotiView>
                )}
                {(!forEvent || showGenerateButton) && (
                  <Button
                    onPress={handleGenerateDescription}
                    disabled={isProcessing}
                  >
                    <XStack alignItems='center'>
                        <Text>{isProcessing ? 'Generating...' : 'Generate Description'}</Text>
                        {isProcessing && <Spinner size='small' color='white' />}
                    </XStack>
                  </Button>
                )}
                <YGroup.Item>
                  <Label>Description</Label>
                  <Input
                    placeholder="Description of the Expense"
                    multiline
                    onChangeText={(value) => handleInputChange('description', value)}
                    value={formData.description}
                  />
                </YGroup.Item>
              </YGroup>
            </YStack>
          )}
    
          {currentStep === 5 && (
            <OverviewScreen formData={formData} />
          )}
    
    <XStack space="$4">
      {currentStep > 1 && <Button variant="outlined" position='absolute' left={0} bottom={0} onPress={handlePrevStep}>Back</Button>}
      {submitButtonDisabled && currentStep === 5 ? (
        <Text color="red" position='absolute' right={0} bottom={0}>
          Please fill in all fields to submit.
        </Text>
      ) : (
        <Button 
          position='absolute'
          right={0}
          bottom={0}
          onPress={currentStep === 5 ? handleSubmit : handleNextStep}>
          {currentStep === 5 ? 'Submit' : 'Next'}
        </Button>
      )}
    </XStack>
  </MyStack>
);
}
