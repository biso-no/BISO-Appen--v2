import React, { useEffect, useState } from 'react'; 
import { Button, Text, YStack, Input, H6, YGroup, Label, XStack, ScrollView, Spinner } from 'tamagui'; 
import { FileUpload } from '@/lib/file-upload'; 
import { useAuth } from '@/components/context/core/auth-provider';
import CampusSelector from '@/components/SelectCampus'; 
import { MyStack } from '@/components/ui/MyStack'; 
import DepartmentSelector from '@/components/SelectDepartments'; 
import { updateDocument, triggerFunction, storage, databases } from '@/lib/appwrite'; 
import { MotiView } from 'moti';
import { useDebounce } from 'use-debounce';
import OverviewScreen from './overview';
import { Switch } from '@/components/ui/switch';
import { ID, Models } from 'react-native-appwrite';
import { uriToBlob } from '@/lib/utils/uriToBlob';
import { useRouter } from 'expo-router';
import { useProfile } from '@/components/context/core/profile-provider';
export interface Attachment { 
    url: string; 
    description: string; 
    date: Date; 
    amount: number; 
    type: 'pdf' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'heic';
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
    const { user: data, isLoading } = useAuth();
    const { profile } = useProfile();
    const [currentStep, setCurrentStep] = useState(1); 
    const [expenseId, setExpenseId] = useState<string | null>(null); 
    const [selectedCampus, setSelectedCampus] = useState<Models.Document | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<Models.Document | null>(null);
    const [forEvent, setForEvent] = useState(false);
    const [eventName, setEventName] = useState<string>("");
    const [debouncedEventName] = useDebounce(eventName, 500);
    const [showGenerateButton, setShowGenerateButton] = useState(false);
    const [formData, setFormData] = useState<FormData>({ 
        bank_account: profile?.bank_account || "", 
        campus: profile?.campus || "",
        department: profile?.department || "",
        expenseAttachments: [],
        description: "", 
        prepayment_amount: 0, 
        total: 0, 
        status: "draft"
    }); 
    const [receivedPrepayment, setReceivedPrepayment] = useState(formData.prepayment_amount > 0); 
    const [isProcessing, setIsProcessing] = useState(false);

    const router = useRouter();
 
    const handleNextStep = () => setCurrentStep((prevStep) => Math.min(prevStep + 1, 5)); 

    const handlePrevStep = () => setCurrentStep((prevStep) => Math.max(prevStep - 1, 1)); 

    const handleInputChange = (field: keyof FormData, value: string | number | Models.Document) => { 
        setFormData((prevData) => ({
            ...prevData, 
            [field]: value
        })); 
    }; 

    const handleAttachmentsChange = (attachments: Attachment[]) => { 
        setFormData((prevData) => ({
            ...prevData, 
            expenseAttachments: attachments
        })); 
    };

    const handleCampusChange = (campus: Models.Document | null) => { 
        setSelectedCampus(campus);
        handleInputChange('campus', campus?.name ?? '');
        handleInputChange('department', {} as Models.Document); 
    }; 

    const handleSaveDraft = async () => { 
        if (!profile) return; 
        const newExpense = await updateDocument('user', profile.$id, { 
            expenses: [{ 
                ...formData, 
                status: 'draft', 
            }], 
        });
        setExpenseId(newExpense.$id); 
    }; 

    const resetForm = () => { 
        setFormData({ 
            bank_account: profile?.bank_account || "", 
            campus: selectedCampus?.name || "",
            department: selectedDepartment?.name || "",
            expenseAttachments: [],
            description: "", 
            prepayment_amount: 0, 
            total: 0, 
            status: "draft"
        }); 
    };

    const handleSubmit = async () => { 
        if (!profile) return; 

        setIsProcessing(true);

        const updatedAttachments = await Promise.all(formData.expenseAttachments.map(async (attachment) => {
            const fileId = ID.unique();
            const blob = await uriToBlob(attachment.url);

            const customFile = {
                name: attachment.description,
                type: blob.type,
                size: blob.size,
                uri: attachment.url,
            };

            const uploadResult = await storage.createFile('expenses', fileId, customFile);
            const downloadUrl = 'https://appwrite.biso.no/v1/storage/buckets/expenses/files/' + uploadResult.$id + '/view?project=biso';

            return {
                ...attachment,
                url: downloadUrl,
            };
        }));

        const updatedFormData = {
            ...formData,
            expenseAttachments: updatedAttachments,
        };

        const newExpense = await databases.createDocument('app', 'expense', ID.unique(),{ 
                ...updatedFormData, 
                status: 'pending', 
                userId: data?.$id,
                user: data?.$id
        });
        setExpenseId(newExpense.$id); 
        setIsProcessing(false);
        resetForm();
        router.push('/explore/expenses');
    };

    useEffect(() => {
        setShowGenerateButton(!!debouncedEventName);
    }, [debouncedEventName]);

    const handleGenerateDescription = async () => {
        setIsProcessing(true);
        const descriptions = formData.expenseAttachments.map(attachment => attachment.description).join(', ');
        const event = eventName ? `for ${eventName}` : '';
        const body = { descriptions, event };

        const overallDescription = await triggerFunction({
            functionId: 'generate_expense_description',
            async: false,
            data: JSON.stringify(body)
        });

        if (overallDescription) {
            const responseBody = JSON.parse(overallDescription.responseBody);
            handleInputChange('description', responseBody.description);
        }
        setIsProcessing(false);
    };

    useEffect(() => {
        const total = formData.expenseAttachments.reduce((acc, attachment) => acc + attachment.amount, 0);
        handleInputChange('total', total);
    }, [formData.expenseAttachments]);

    const submitButtonDisabled = currentStep === 5 && (
      !formData.bank_account || 
      !formData.description || 
      !formData.total || 
      !formData.expenseAttachments.length
    );

    if (isLoading || !data || !profile) { 
        return <Text>Loading...</Text>; 
    } 

    return (
        <MyStack gap="$4" padding="$4">
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
                    onChangeText={(value) => handleInputChange('prepayment_amount', parseFloat(value))}
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
                    initialCampus={selectedCampus || undefined}
                  />
                </YGroup.Item>
                {formData.campus && (
                  <YGroup.Item>
                    <Label>Department</Label>
                    <DepartmentSelector
                    campus={selectedCampus?.$id}
                    onSelect={(value) => (
                      handleInputChange('department', value.Name),
                      setSelectedDepartment(value)
                    )}
                    selectedDepartments={selectedDepartment ? [selectedDepartment] : []}
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
                setOcrResults={(attachments: Attachment[] | ((prevAttachments: Attachment[]) => Attachment[])) => {
                  if (Array.isArray(attachments)) {
                    setFormData(prevData => ({
                      ...prevData,
                      expenseAttachments: attachments,
                    }));
                  } else {
                    setFormData(prevData => ({
                      ...prevData,
                      expenseAttachments: attachments(prevData.expenseAttachments),
                    }));
                  }
                }}
              />
            </YStack>
          )}
    
          {currentStep === 4 && (
            <YStack>
              <YGroup gap="$4">
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
                      disabled={
                        isProcessing || 
                        formData.expenseAttachments.length === 0 || 
                        formData.expenseAttachments.some((attachment) => !attachment.description)
                      }
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
    
    <XStack gap="$4">
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
