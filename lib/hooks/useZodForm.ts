import { useEffect } from 'react';
import { useForm, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useFormStore, FormId } from '@/lib/stores/formStore';

// Define the props type for the hook
export interface UseZodFormProps<TSchema extends z.ZodType<any, any>> extends Omit<UseFormProps<z.infer<TSchema>>, 'resolver'> {
  schema: TSchema;
  formId: FormId;
  syncWithStore?: boolean;
}

/**
 * Custom hook that integrates React Hook Form with Zod validation and Zustand form store
 * 
 * @param props - Configuration options including Zod schema and form ID
 * @returns React Hook Form methods and additional utility functions
 */
export function useZodForm<TSchema extends z.ZodType<any, any>>({
  schema,
  formId,
  syncWithStore = true,
  defaultValues,
  mode = 'onChange',
  ...formProps
}: UseZodFormProps<TSchema>): UseFormReturn<z.infer<TSchema>> & {
  formId: FormId;
  isStoreValid: boolean;
} {
  // Initialize React Hook Form with Zod resolver
  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode,
    ...formProps,
  });

  // Access form store actions
  const { 
    initForm, 
    setFormValue, 
    setFormError, 
    setFieldTouched,
    getForm,
    validateWithSchema,
    clearForm,
    registerSchema
  } = useFormStore();

  // Register the schema with the form store
  useEffect(() => {
    registerSchema(formId, schema);
  }, [formId, schema, registerSchema]);

  // Initialize form in store with default values
  useEffect(() => {
    if (!syncWithStore) return;
    
    initForm(formId, defaultValues as Record<string, unknown>);
    
    // Cleanup form when component unmounts
    return () => {
      clearForm(formId);
    };
  }, [formId, defaultValues, initForm, clearForm, syncWithStore]);

  // Sync form values with store on field change
  useEffect(() => {
    if (!syncWithStore) return;
    
    const subscription = form.watch((values, { name, type }) => {
      if (name && type === 'change') {
        setFormValue(formId, name, form.getValues(name as any));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, formId, setFormValue, syncWithStore]);

  // Sync touched fields with store
  useEffect(() => {
    if (!syncWithStore) return;
    
    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      const name = event.target.name;
      if (name) {
        setFieldTouched(formId, name, true);
      }
    };
    
    // Apply to document for form fields
    document.addEventListener('blur', handleBlur as any, true);
    
    return () => {
      document.removeEventListener('blur', handleBlur as any, true);
    };
  }, [formId, setFieldTouched, syncWithStore]);

  // Sync errors with store on validation
  useEffect(() => {
    if (!syncWithStore) return;
    
    const errors = form.formState.errors;
    
    Object.entries(errors).forEach(([field, error]) => {
      if (error?.message) {
        setFormError(formId, field, String(error.message));
      }
    });
  }, [form.formState.errors, formId, setFormError, syncWithStore]);

  // Get current form state from store
  const currentForm = getForm(formId);

  // Add additional properties to the returned form methods
  return {
    ...form,
    formId,
    isStoreValid: currentForm?.isValid || false,
  };
}

/**
 * Similar to useZodForm but for forms not tied to specific schemas
 */
export function useRHFWithStore<TFieldValues extends FieldValues = FieldValues>(
  formId: FormId,
  options: UseFormProps<TFieldValues> = {}
) {
  const form = useForm<TFieldValues>(options);
  const { 
    initForm, 
    setFormValue, 
    clearForm,
    getForm 
  } = useFormStore();

  // Initialize form in store with default values
  useEffect(() => {
    initForm(formId, options.defaultValues as Record<string, unknown> || {});
    
    return () => {
      clearForm(formId);
    };
  }, [formId, options.defaultValues, initForm, clearForm]);

  // Sync form values with store on field change
  useEffect(() => {
    const subscription = form.watch((values, { name, type }) => {
      if (name && type === 'change') {
        setFormValue(formId, name, form.getValues(name as any));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, formId, setFormValue]);

  // Get current form state from store
  const currentForm = getForm(formId);

  return {
    ...form,
    formId,
    isStoreValid: currentForm?.isValid || false,
  };
} 