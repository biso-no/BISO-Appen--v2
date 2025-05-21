import React, { useEffect, useMemo, useState } from 'react';
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
import { CustomSwitch } from '@/components/custom-switch';
import { useAIAssistanceStore } from './FileUpload';
import { functions } from '@/lib/appwrite';
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';

export function MultiStepForm() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile } = useProfileStore();
  const { t } = useTranslation();
  // Initialize expense form hook with custom validation
  const methods = useForm({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      bank_account: profile?.bank_account || "",
      user: user?.$id,
      campus: profile?.campus_id || "",
      department: profile?.departments_id?.[0] || "",
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
  const [receivedPrepayment, setReceivedPrepayment] = useState(false);
  const description = watch('description');
  const eventName = watch('eventName');
  const rawExpenseAttachments = watch('expenseAttachments');
  
  const expenseAttachments = useMemo(() => rawExpenseAttachments || [], [rawExpenseAttachments]);
  const [debouncedEventName] = useDebounce(eventName || '', 500);

  const { isEnabled: isAIAssistanceEnabled } = useAIAssistanceStore();
  
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

  const handleLastStep = () => {
    if (isAIAssistanceEnabled) {
      handleGenerateDescription().then(() => {
        actions.nextStep()
      })
    } else {
      actions.nextStep()
    }
  }
  
  // Handle prepayment toggle
  const handlePrepaymentToggle = (value: boolean) => {
    setReceivedPrepayment(value);
    if (!value) {
      setValue('prepayment_amount', 0);
    }
  };
  
  // Handle campus selection
  const handleCampusChange = (campus: any) => {
    if (campus) {
      console.log('Selected campus:', campus);
      
      // Set the campus in the form
      setValue('campus', campus.name);
      setValue('department', ''); // Reset department when campus changes
      
      // Set the campus in the store
      actions.setSelectedCampus(campus);
    }
  };
  
  // Handle department selection
  const handleDepartmentChange = (department: any) => {
    if (department) {
      setValue('department', department.$id);
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
    console.log('data', data)
    
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
      label: t('payment-details'),
      content: (
        <ScrollView>
          <YStack gap="$4" padding="$4">
            <H6 fontWeight="bold">{t('payment-details')}</H6>
            <YGroup gap="$2">
              <YGroup.Item>
                <Label>{t('bank-account')}</Label>
                <Input
                  placeholder={t('bank-account')}
                  onChangeText={(value) => setValue('bank_account', value)}
                  value={watch('bank_account')}
                />
                {errors.bank_account && (
                  <Text color="$red10">{errors.bank_account.message as string}</Text>
                )}
              </YGroup.Item>
              <YGroup.Item>
                <XStack gap="$2" alignItems="center">
                  <CustomSwitch 
                    checked={receivedPrepayment} 
                    onCheckedChange={handlePrepaymentToggle} 
                  />
                  <Text>{t('did-you-receive-a-prepayment')}</Text>
                </XStack>
              </YGroup.Item>
              {receivedPrepayment && (
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <YGroup.Item>
                    <Label>{t('how-much-was-prepaid')}</Label>
                    <Input
                      placeholder={t('prepayment-amount')}
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
      label: t('department'),
      content: (
        <ScrollView>
          <YStack gap="$4" padding="$4">
            <H6 fontWeight="bold">{t('department-information')}</H6>
            {console.log('Department step - selectedCampus:', form.selectedCampus)}
            <YGroup>
              <YGroup.Item>
                <Label>{t('campus')}</Label>
                <CampusSelector
                  onSelect={handleCampusChange}
                  campus={watch('campus')}
                  initialCampus={form.selectedCampus || undefined}
                />
                {errors.campus && (
                  <Text color="$red10">{errors.campus.message as string}</Text>
                )}
              </YGroup.Item>
              {form.selectedCampus && (
                <YGroup.Item>
                  <Label>{t('department')}</Label>
                  <DepartmentSelector
                    title=""
                    campus={form.selectedCampus.$id}
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
      label: t('attachments'),
      content: (
        <ScrollView>
          <YStack gap="$4" padding="$4" width="100%">
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
      label: t('event'),
      content: (
        <ScrollView>
          <YStack gap="$4" padding="$4">
            <H6 fontWeight="bold">{t('event-information-optional')}</H6>
            <Text>{t('is-this-expense-related-to-a-specific-event')}</Text>
            <YGroup marginTop="$2">
              <YGroup.Item>
                <XStack gap="$2" alignItems="center">
                  <CustomSwitch 
                    checked={!!eventName} 
                    onCheckedChange={(val: boolean) => {
                      if (!val) {
                        setValue('eventName', '');
                      } else {
                        setValue('eventName', t('event-0')); // Set default value when toggled on
                      }
                    }} 
                  />
                  <Text>{t('expense-for-event')}</Text>
                </XStack>
              </YGroup.Item>
              {!!eventName && (
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <YGroup.Item>
                    <Label>{t('event-name')}</Label>
                    <Input
                      placeholder={t('event-name-0')}
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
      onNext: handleLastStep,
      onPrevious: handlePrevStep,
    },
    {
      label: t('overview'),
      content: (
        <ScrollView>
          <YStack gap="$4" padding="$4">
            <H6 fontWeight="bold">{t('description-and-review')}</H6>
            
            <YStack gap="$2">
              <XStack justifyContent="space-between">
                <Label>{t('description')}</Label>
              </XStack>
              <Input
                placeholder={t('expense-description')}
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
            
            <YStack gap="$4" marginTop="$4">
              <H6>{t('expense-summary')}</H6>
              
              <Card bordered padding="$4">
                <YStack gap="$3">
                  <XStack justifyContent="space-between">
                    <Text color="$gray11">{t('bank-account-0')}</Text>
                    <Text>{watch('bank_account') || t('not-provided')}</Text>
                  </XStack>
                  
                  <XStack justifyContent="space-between">
                    <Text color="$gray11">Campus:</Text>
                    <Text>{watch('campus') || t('not-selected')}</Text>
                  </XStack>
                  
                  <XStack justifyContent="space-between">
                    <Text color="$gray11">Department:</Text>
                    <Text>{watch('department') || t('not-selected-0')}</Text>
                  </XStack>
                  
                  {receivedPrepayment && (
                    <XStack justifyContent="space-between">
                      <Text color="$gray11">{t('prepayment-amount-0')}</Text>
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
                    <Text color="$gray11" fontWeight="bold">{t('total-amount')}</Text>
                    <Text fontWeight="bold" color="$green9">{watch('total')} kr</Text>
                  </XStack>
                </YStack>
              </Card>
            </YStack>
            
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
