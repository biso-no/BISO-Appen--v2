import React, { useEffect, useState } from 'react'; 
import { Button, Text, YStack, Input, H6, YGroup, Label, Checkbox, XStack, ScrollView } from 'tamagui'; 
import { FileUpload } from '@/lib/file-upload'; 
import { useAuth } from '@/components/context/auth-provider'; 
import { Check as CheckIcon } from '@tamagui/lucide-icons'; 
import CampusSelector from '@/components/SelectCampus'; 
import { MyStack } from '@/components/ui/MyStack'; 
import DepartmentSelector from '@/components/SelectDepartments'; 
import { createDocument, updateDocument, triggerFunction } from '@/lib/appwrite'; 
import { Switch } from 'tamagui'; 
import { MotiView } from 'moti';
import { useDebounce } from 'use-debounce';
import OverviewScreen from './overview';

export interface Attachment { 
    url: string; 
    description: string; 
    date: string; 
    amount: string; 
}

type FormData = {
  bank_account: string;
  campus: string;
  department: string;
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
    const [forEvent, setForEvent] = useState(false);
    const [eventName, setEventName] = useState<string>("");
    const [debouncedEventName] = useDebounce(eventName, 500);
    const [showGenerateButton, setShowGenerateButton] = useState(false);
    const [formData, setFormData] = useState<FormData>({ 
        bank_account: profile?.bank_account || "", 
        campus: profile?.campus || "", 
        department: profile?.departments?.[0] || "", 
        expenseAttachments: [], 
        description: "", 
        prepayment_amount: 0, 
        total: 0, 
        status: "pending", 
    }); 
    const [receivedPrepayment, setReceivedPrepayment] = useState(formData.prepayment_amount > 0); 
 
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

    const handleInputChange = (field: keyof FormData, value: string | number | Attachment[]) => { 
        setFormData(prevData => ({ 
            ...prevData, 
            [field]: value, 
        })); 
    }; 

    const handleCampusChange = (campus: string) => { 
        handleInputChange('campus', campus);
        handleInputChange('department', ''); 
    }; 

    const handleDepartmentChange = (department: string) => { 
        handleInputChange('department', department); 
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
            return;
        }
        const responseBody = JSON.parse(overallDescription.responseBody);
        handleInputChange('description', responseBody.description);
    };

    //Whenever an attachment is added, update the total
    useEffect(() => {
        let total = 0;
        formData.expenseAttachments.forEach(attachment => {
            total += parseInt(attachment.amount);
        });
        handleInputChange('total', total);
    }, [formData.expenseAttachments]);  // Dependencies updated to prevent re-render loop
    
    

    return (
        <MyStack space="$4" padding="$4">
          {currentStep === 1 && (
            <ScrollView>
              <H6 fontWeight="bold">Are the details correct?</H6>
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
                  <Label>Did you receive a prepayment?</Label>
                  <Switch checked={receivedPrepayment} onCheckedChange={() => setReceivedPrepayment(!receivedPrepayment)} />
                </YGroup.Item>
              </YGroup>
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
                  <Label>Is this expense related to a specific event?</Label>
                  <Switch checked={forEvent} onCheckedChange={() => setForEvent(!forEvent)} />
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
                  <Button onPress={handleGenerateDescription}>Try generate a description!</Button>
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
            {currentStep > 1 && <Button onPress={handlePrevStep}>Back</Button>}
            <Button onPress={currentStep === 5 ? handleSubmit : handleNextStep}>
              {currentStep === 5 ? 'Submit' : 'Next'}
            </Button>
          </XStack>
        </MyStack>
      );
    }
