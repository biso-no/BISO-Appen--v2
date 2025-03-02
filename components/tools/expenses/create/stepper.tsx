import React, { useEffect } from 'react';
import {
  Button, Text, YStack, Input, H6, YGroup, Label,
  XStack, ScrollView, Spinner, Switch, Card
} from 'tamagui';
import { FileUpload } from './FileUpload';
import { useRouter } from 'expo-router';
import { MultiStepForm as StepperUI, Step } from '@/components/ui/multi-step-form';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { expenseFormSchema } from '@/lib/schemas/expenseSchema';
import CampusSelector from '@/components/SelectCampus';
import DepartmentSelector from '@/components/SelectDepartments';
import { useProfileStore } from '@/lib/stores/profileStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { MotiView } from 'moti';
import { useDebounce } from 'use-debounce';
import { Check } from '@tamagui/lucide-icons';

export function MultiStepForm() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile } = useProfileStore();
  
  // Initialize expense form hook with custom validation
  const methods = useForm({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      bank_account: profile?.bank_account || "",
      campus: profile?.campus || "",
      department: profile?.department || "",
      expenseAttachments: [],
      description: "",
      prepayment_amount: 0,
      total: 0,
      status: "draft" as const,
      eventName: ""
    },
    mode: 'onChange'
  });
  
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty }
  } = methods;
  
  // Get form values
  const receivedPrepayment = watch('prepayment_amount') > 0;
  const description = watch('description');
  const eventName = watch('eventName');
  const expenseAttachments = watch('expenseAttachments') || [];
  const [debouncedEventName] = useDebounce(eventName || '', 500);
  
  // Get store and query hooks
  const {
    form,
    actions,
    createExpense,
    isCreating,
    saveDraft,
    isSavingDraft,
    generateDescription,
    isGeneratingDescription
  } = useExpenses();
  
  // Set up event name effect
  const showGenerateButton = !!debouncedEventName;
  
  // Calculate total automatically based on attachments
  useEffect(() => {
    if (expenseAttachments.length > 0) {
      const total = expenseAttachments.reduce((acc, att) => acc + att.amount, 0);
      setValue('total', total);
    } else {
      setValue('total', 0);
    }
  }, [expenseAttachments, setValue]);
  
  // Handle form steps
  const handleNextStep = () => {
    actions.nextStep();
  };
  
  const handlePrevStep = () => {
    actions.prevStep();
  };
  
  // Handle prepayment toggle
  const handlePrepaymentToggle = (value: boolean) => {
    if (!value) {
      setValue('prepayment_amount', 0);
    }
  };
  
  // Handle campus selection
  const handleCampusChange = (campus: any) => {
    if (campus) {
      setValue('campus', campus.name);
      setValue('department', ''); // Reset department when campus changes
      actions.setSelectedCampus(campus);
    }
  };
  
  // Handle department selection
  const handleDepartmentChange = (department: any) => {
    if (department) {
      setValue('department', department.Name || department.name);
      actions.setSelectedDepartment(department);
    }
  };
  
  // Description generation
  const handleGenerateDescription = async () => {
    if (expenseAttachments.length === 0) return;
    
    const descriptions = expenseAttachments.map(a => a.description).join(', ');
    
    generateDescription({
      descriptions,
      eventName: eventName || ''
    });
  };
  
  // Submit the form
  const onSubmit = async (data: any) => {
    if (!user?.$id) return;
    
    // Update the store with form data
    actions.setCurrentExpense({
      ...data,
      status: 'pending'
    });
    
    // Submit the expense
    createExpense();
    
    // Navigate back to expenses list on success
    router.push('/explore/expenses');
  };
  
  // Save as draft
  const handleSaveDraft = async () => {
    if (!user?.$id) return;
    
    const currentData = methods.getValues();
    
    // Update the store with form data
    actions.setCurrentExpense({
      ...currentData,
      status: 'draft'
    });
    
    // Save as draft
    saveDraft();
  };
  
  // Define steps
  const steps: Step[] = [
    {
      label: 'Payment Details',
      content: (
        <ScrollView>
          <YStack space="$4" padding="$4">
            <H6 fontWeight="bold">Payment Details</H6>
            <YGroup>
              <YGroup.Item>
                <Label>Bank Account</Label>
                <Input
                  placeholder="Bank Account"
                  onChangeText={(value) => setValue('bank_account', value)}
                  value={watch('bank_account')}
                />
                {errors.bank_account && (
                  <Text color="$red10">{errors.bank_account.message as string}</Text>
                )}
              </YGroup.Item>
              <YGroup.Item>
                <XStack space="$2" alignItems="center">
                  <Switch 
                    checked={receivedPrepayment} 
                    onCheckedChange={handlePrepaymentToggle} 
                    size="$4" 
                  />
                  <Text>Did you receive a prepayment?</Text>
                </XStack>
              </YGroup.Item>
              {receivedPrepayment && (
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <YGroup.Item>
                    <Label>How much was prepaid?</Label>
                    <Input
                      placeholder="Prepayment Amount"
                      onChangeText={(value) => setValue('prepayment_amount', parseFloat(value) || 0)}
                      value={watch('prepayment_amount').toString()}
                      keyboardType="numeric"
                    />
                  </YGroup.Item>
                </MotiView>
              )}
            </YGroup>
          </YStack>
        </ScrollView>
      ),
      onNext: handleNextStep,
      onPrevious: handlePrevStep,
    },
    {
      label: 'Department',
      content: (
        <ScrollView>
          <YStack space="$4" padding="$4">
            <H6 fontWeight="bold">Department Information</H6>
            <YGroup>
              <YGroup.Item>
                <Label>Campus</Label>
                <CampusSelector
                  onSelect={handleCampusChange}
                  campus={watch('campus')}
                  initialCampus={form.selectedCampus || undefined}
                />
                {errors.campus && (
                  <Text color="$red10">{errors.campus.message as string}</Text>
                )}
              </YGroup.Item>
              {watch('campus') && (
                <YGroup.Item>
                  <Label>Department</Label>
                  <DepartmentSelector
                    campus={form.selectedCampus?.$id}
                    onSelect={handleDepartmentChange}
                    selectedDepartments={form.selectedDepartment ? [form.selectedDepartment] : []}
                  />
                  {errors.department && (
                    <Text color="$red10">{errors.department.message as string}</Text>
                  )}
                </YGroup.Item>
              )}
            </YGroup>
          </YStack>
        </ScrollView>
      ),
      onNext: handleNextStep,
      onPrevious: handlePrevStep,
    },
    {
      label: 'Attachments',
      content: (
        <ScrollView>
          <YStack space="$4" padding="$4">
            <FileUpload />
            {errors.expenseAttachments && (
              <Text color="$red10">{errors.expenseAttachments.message as string}</Text>
            )}
          </YStack>
        </ScrollView>
      ),
      onNext: handleNextStep,
      onPrevious: handlePrevStep,
    },
    {
      label: 'Event',
      content: (
        <ScrollView>
          <YStack space="$4" padding="$4">
            <H6 fontWeight="bold">Event Information (Optional)</H6>
            <Text>Is this expense related to a specific event?</Text>
            <YGroup marginTop="$2">
              <YGroup.Item>
                <XStack space="$2" alignItems="center">
                  <Switch 
                    checked={!!eventName} 
                    onCheckedChange={(val: boolean) => {
                      if (!val) setValue('eventName', '');
                    }} 
                    size="$4" 
                  />
                  <Text>Expense for event?</Text>
                </XStack>
              </YGroup.Item>
              {!!eventName && (
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <YGroup.Item>
                    <Label>Event Name</Label>
                    <Input
                      placeholder="Event Name"
                      onChangeText={(value) => setValue('eventName', value)}
                      value={eventName || ''}
                    />
                  </YGroup.Item>
                </MotiView>
              )}
            </YGroup>
          </YStack>
        </ScrollView>
      ),
      onNext: handleNextStep,
      onPrevious: handlePrevStep,
    },
    {
      label: 'Overview',
      content: (
        <ScrollView>
          <YStack space="$4" padding="$4">
            <H6 fontWeight="bold">Description & Review</H6>
            
            <YStack space="$2">
              <XStack justifyContent="space-between">
                <Label>Description</Label>
                {showGenerateButton && (
                  <Button
                    size="$2"
                    onPress={handleGenerateDescription}
                    disabled={isGeneratingDescription}
                  >
                    {isGeneratingDescription ? <Spinner /> : 'AI Generate'}
                  </Button>
                )}
              </XStack>
              <Input
                placeholder="Expense Description"
                onChangeText={(value) => setValue('description', value)}
                value={description}
                multiline
                numberOfLines={4}
                minHeight={100}
                textAlignVertical="top"
              />
              {errors.description && (
                <Text color="$red10">{errors.description.message as string}</Text>
              )}
            </YStack>
            
            <YStack space="$4" marginTop="$4">
              <H6>Expense Summary</H6>
              
              <Card bordered padding="$4">
                <YStack space="$3">
                  <XStack justifyContent="space-between">
                    <Text color="$gray11">Bank Account:</Text>
                    <Text>{watch('bank_account') || 'Not provided'}</Text>
                  </XStack>
                  
                  <XStack justifyContent="space-between">
                    <Text color="$gray11">Campus:</Text>
                    <Text>{watch('campus') || 'Not selected'}</Text>
                  </XStack>
                  
                  <XStack justifyContent="space-between">
                    <Text color="$gray11">Department:</Text>
                    <Text>{watch('department') || 'Not selected'}</Text>
                  </XStack>
                  
                  {receivedPrepayment && (
                    <XStack justifyContent="space-between">
                      <Text color="$gray11">Prepayment Amount:</Text>
                      <Text>{watch('prepayment_amount')} kr</Text>
                    </XStack>
                  )}
                  
                  {eventName && (
                    <XStack justifyContent="space-between">
                      <Text color="$gray11">Event:</Text>
                      <Text>{eventName}</Text>
                    </XStack>
                  )}
                  
                  <XStack justifyContent="space-between">
                    <Text color="$gray11">Attachments:</Text>
                    <Text>{expenseAttachments.length} items</Text>
                  </XStack>
                  
                  <XStack justifyContent="space-between">
                    <Text color="$gray11" fontWeight="bold">Total Amount:</Text>
                    <Text fontWeight="bold" color="$green9">{watch('total')} kr</Text>
                  </XStack>
                </YStack>
              </Card>
            </YStack>
            
            <XStack space="$2" marginTop="$4">
              <Button
                flex={1}
                onPress={handleSaveDraft}
                disabled={isSavingDraft || !isDirty}
              >
                {isSavingDraft ? <Spinner /> : 'Save as Draft'}
              </Button>
              
              <Button
                flex={1}
                backgroundColor="$green9"
                color="white"
                onPress={handleSubmit(onSubmit)}
                disabled={isCreating || !isValid}
                icon={isValid ? <Check size={16} color="white" /> : undefined}
              >
                {isCreating ? <Spinner /> : 'Submit Expense'}
              </Button>
            </XStack>
          </YStack>
        </ScrollView>
      ),
      onPrevious: handlePrevStep,
    },
  ];

  // Show loading if user data is not yet available
  if (!user || !profile) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" />
        <Text marginTop="$4">Loading...</Text>
      </YStack>
    );
  }

  return (
    <FormProvider {...methods}>
      <StepperUI
        steps={steps}
        onSubmit={handleSubmit(onSubmit)}
      />
    </FormProvider>
  );
}
