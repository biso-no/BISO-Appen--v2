import React, { useEffect } from 'react';
import { FormId, useFormStore } from '@/lib/stores/formStore';
import { Button, Form, Input, Paragraph, Stack, XStack, YStack } from 'tamagui';
import { AlertCircle, Check, Eye, EyeOff } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { View, Text } from 'react-native';

// Form ID for this example
const FORM_ID: FormId = 'login';

// Validate email field
function validateEmail(email: string): string | undefined {
  if (!email) return 'Email is required';
  if (!/\S+@\S+\.\S+/.test(email)) return 'Email is invalid';
  return undefined;
}

// Validate password field
function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters long';
  return undefined;
}

// Field component with error handling
function FormField({ 
  label, 
  name, 
  placeholder, 
  formId,
  type = 'text',
  validate,
}: { 
  label: string; 
  name: string; 
  placeholder?: string;
  formId: FormId;
  type?: 'text' | 'email' | 'password';
  validate?: (value: string) => string | undefined;
}) {
  const [showPassword, setShowPassword] = useState(false);
  
  // Select only the pieces of state we need
  const value = useFormStore(state => state.forms[formId]?.values[name] || '');
  const error = useFormStore(state => state.forms[formId]?.errors[name]);
  const touched = useFormStore(state => state.forms[formId]?.touched[name]);
  
  // Get the actions we need
  const setFormValue = useFormStore(state => state.setFormValue);
  const setFormError = useFormStore(state => state.setFormError);
  const setFieldTouched = useFormStore(state => state.setFieldTouched);

  // Handle validation on blur
  const handleBlur = () => {
    setFieldTouched(formId, name, true);
    if (validate) {
      const error = validate(value);
      setFormError(formId, name, error);
    }
  };

  // Handle change with optional validation
  const handleChange = (text: string) => {
    setFormValue(formId, name, text);
    
    // If field was already touched, validate on change too
    if (touched && validate) {
      const error = validate(text);
      setFormError(formId, name, error);
    }
  };

  return (
    <Stack space="$2" marginBottom="$3">
      <Text>{label}</Text>
      <XStack alignItems="center" width="100%">
        <Input
          flex={1}
          placeholder={placeholder}
          value={value}
          onChangeText={handleChange}
          onBlur={handleBlur}
          secureTextEntry={type === 'password' && !showPassword}
          autoCapitalize={type === 'email' ? 'none' : 'sentences'}
          keyboardType={type === 'email' ? 'email-address' : 'default'}
          borderColor={touched && error ? '$red8' : undefined}
        />
        
        {type === 'password' && (
          <Button
            position="absolute"
            right="$2"
            size="$2"
            circular
            transparent
            onPress={() => setShowPassword(!showPassword)}
            icon={showPassword ? EyeOff : Eye}
          />
        )}
      </XStack>
      
      {touched && error ? (
        <XStack alignItems="center" space="$1">
          <AlertCircle size={14} color="$red9" />
          <Text style={{ color: '#e5484d', fontSize: 12 }}>{error}</Text>
        </XStack>
      ) : null}
    </Stack>
  );
}

export function FormStoreExample() {
  // Initialize form on component mount
  const { initForm, forms, setFormSubmitting, setFormValid, clearForm, setFormErrors } = useFormStore();
  
  useEffect(() => {
    // Initialize with default values
    initForm(FORM_ID, {
      email: '',
      password: ''
    });
    
    // Cleanup on unmount
    return () => {
      clearForm(FORM_ID);
    };
  }, []);
  
  // Get form state for current form
  const form = forms[FORM_ID];
  const isSubmitting = form?.isSubmitting || false;
  const isValid = form?.isValid || false;
  const isDirty = form?.isDirty || false;
  
  // Handle form submission
  const handleSubmit = () => {
    if (!form) return;
    
    // Validate all fields first
    const email = form.values.email || '';
    const password = form.values.password || '';
    
    const errors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    
    // Update all errors at once
    setFormErrors(FORM_ID, errors);
    
    // Check if form is valid
    const hasErrors = Object.values(errors).some(error => !!error);
    setFormValid(FORM_ID, !hasErrors);
    
    if (hasErrors) {
      console.log('Form has errors, cannot submit');
      return;
    }
    
    // Show submitting state
    setFormSubmitting(FORM_ID, true);
    
    // Simulate API call
    console.log('Submitting form with values:', form.values);
    setTimeout(() => {
      // Complete submission
      setFormSubmitting(FORM_ID, false);
      
      // Success message would go here
      console.log('Form submitted successfully!');
      
      // In a real app, you would navigate or show success here
    }, 1500);
  };
  
  return (
    <YStack space="$4" padding="$4" marginBottom="$8">
      <Paragraph size="$6" fontWeight="bold">Zustand Form Example</Paragraph>
      <Paragraph size="$3" marginBottom="$2">
        This demonstrates using Zustand for form state management with validation.
        Notice how only the specific form fields re-render when their values change.
      </Paragraph>
      
      <FormField 
        label="Email" 
        name="email" 
        placeholder="Enter your email"
        formId={FORM_ID}
        type="email"
        validate={validateEmail}
      />
      
      <FormField 
        label="Password" 
        name="password"
        placeholder="Enter your password"
        formId={FORM_ID}
        type="password"
        validate={validatePassword}
      />
      
      <Button 
        onPress={handleSubmit}
        disabled={isSubmitting || !isDirty || !isValid}
        themeInverse={!isSubmitting}
        icon={isValid ? Check : undefined}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
      
      <YStack 
        borderWidth={1} 
        borderColor="$borderColor" 
        padding="$3" 
        borderRadius="$2" 
        marginTop="$2"
      >
        <Paragraph size="$3" fontWeight="bold">Form State:</Paragraph>
        <Text>Valid: {isValid ? 'Yes' : 'No'}</Text>
        <Text>Dirty: {isDirty ? 'Yes' : 'No'}</Text>
        <Text>Submitting: {isSubmitting ? 'Yes' : 'No'}</Text>
      </YStack>
    </YStack>
  );
} 