import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { z } from 'zod';

export type FormId = 
  | 'login' 
  | 'signup' 
  | 'profile' 
  | 'settings'
  | 'createEvent'
  | 'editEvent'
  | 'bugReport'
  | 'feedback'
  | 'contact'
  | string; // Allow custom form IDs

interface FormValues {
  [key: string]: any;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface FormTouched {
  [key: string]: boolean;
}

// Store schema definitions for forms
type SchemaMap = {
  [formId: string]: z.ZodType<any>;
}

interface FormState {
  forms: {
    [formId: string]: {
      values: FormValues;
      errors: FormErrors;
      touched: FormTouched;
      isSubmitting: boolean;
      isValid: boolean;
      isDirty: boolean;
    };
  };
  
  // Schema registry for validation
  schemas: SchemaMap;
  
  // Actions
  initForm: (formId: FormId, initialValues?: FormValues) => void;
  setFormValue: (formId: FormId, field: string, value: any) => void;
  setFormValues: (formId: FormId, values: FormValues) => void;
  setFormError: (formId: FormId, field: string, error?: string) => void;
  setFormErrors: (formId: FormId, errors: FormErrors) => void;
  setFieldTouched: (formId: FormId, field: string, isTouched?: boolean) => void;
  setFormSubmitting: (formId: FormId, isSubmitting: boolean) => void;
  setFormValid: (formId: FormId, isValid: boolean) => void;
  setFormDirty: (formId: FormId, isDirty: boolean) => void;
  resetForm: (formId: FormId) => void;
  clearForm: (formId: FormId) => void;
  
  // Schema registration and validation
  registerSchema: (formId: FormId, schema: z.ZodType<any>) => void;
  validateWithSchema: (formId: FormId, values?: FormValues) => { success: boolean; errors?: FormErrors };
  
  // Selectors (for convenience)
  getForm: (formId: FormId) => {
    values: FormValues;
    errors: FormErrors;
    touched: FormTouched;
    isSubmitting: boolean;
    isValid: boolean;
    isDirty: boolean;
  } | undefined;
}

// Create the form store with Immer
export const useFormStore = create<FormState>()(
  immer((set, get) => ({
    forms: {},
    schemas: {},
    
    // Initialize a form with default values
    initForm: (formId, initialValues = {}) => {
      set(state => {
        state.forms[formId] = {
          values: initialValues,
          errors: {},
          touched: {},
          isSubmitting: false,
          isValid: true,
          isDirty: false,
        };
      });
    },
    
    // Set a single form field value
    setFormValue: (formId, field, value) => {
      const form = get().forms[formId];
      if (!form) {
        get().initForm(formId, { [field]: value });
        return;
      }
      
      set(state => {
        state.forms[formId].values[field] = value;
        state.forms[formId].isDirty = true;
        state.forms[formId].touched[field] = true;
        
        // Auto-validate if schema exists
        const schema = state.schemas[formId];
        if (schema) {
          const result = get().validateWithSchema(formId);
          state.forms[formId].isValid = result.success;
        }
      });
    },
    
    // Set multiple form values at once
    setFormValues: (formId, values) => {
      const form = get().forms[formId];
      if (!form) {
        get().initForm(formId, values);
        return;
      }
      
      set(state => {
        state.forms[formId].values = {
          ...state.forms[formId].values,
          ...values
        };
        state.forms[formId].isDirty = true;
        
        // Auto-validate if schema exists
        const schema = state.schemas[formId];
        if (schema) {
          const result = get().validateWithSchema(formId);
          state.forms[formId].isValid = result.success;
        }
      });
    },
    
    // Set a form field error
    setFormError: (formId, field, error) => {
      const form = get().forms[formId];
      if (!form) return;
      
      set(state => {
        state.forms[formId].errors[field] = error;
        
        // Check if all errors are undefined/null
        const hasErrors = Object.values(state.forms[formId].errors).some(err => !!err);
        state.forms[formId].isValid = !hasErrors;
      });
    },
    
    // Set multiple form errors at once
    setFormErrors: (formId, errors) => {
      const form = get().forms[formId];
      if (!form) return;
      
      set(state => {
        state.forms[formId].errors = errors;
        
        // Check if form is valid
        const hasErrors = Object.values(errors).some(err => !!err);
        state.forms[formId].isValid = !hasErrors;
      });
    },
    
    // Mark a field as touched (visited)
    setFieldTouched: (formId, field, isTouched = true) => {
      const form = get().forms[formId];
      if (!form) return;
      
      set(state => {
        state.forms[formId].touched[field] = isTouched;
      });
    },
    
    // Set form submitting state
    setFormSubmitting: (formId, isSubmitting) => {
      const form = get().forms[formId];
      if (!form) return;
      
      set(state => {
        state.forms[formId].isSubmitting = isSubmitting;
      });
    },
    
    // Set form validity
    setFormValid: (formId, isValid) => {
      const form = get().forms[formId];
      if (!form) return;
      
      set(state => {
        state.forms[formId].isValid = isValid;
      });
    },
    
    // Set form dirty state
    setFormDirty: (formId, isDirty) => {
      const form = get().forms[formId];
      if (!form) return;
      
      set(state => {
        state.forms[formId].isDirty = isDirty;
      });
    },
    
    // Reset form to initial values, clear errors and touched state
    resetForm: (formId) => {
      const form = get().forms[formId];
      if (!form) return;
      
      set(state => {
        state.forms[formId] = {
          values: {},
          errors: {},
          touched: {},
          isSubmitting: false,
          isValid: true,
          isDirty: false,
        };
      });
    },
    
    // Remove the form from state entirely
    clearForm: (formId) => {
      set(state => {
        delete state.forms[formId];
      });
    },
    
    // Register a Zod schema for a form
    registerSchema: (formId, schema) => {
      set(state => {
        state.schemas[formId] = schema;
      });
    },
    
    // Validate form values with registered schema
    validateWithSchema: (formId, values) => {
      const schema = get().schemas[formId];
      const formValues = values || get().forms[formId]?.values || {};
      
      if (!schema) {
        return { success: true };
      }
      
      const result = schema.safeParse(formValues);
      if (result.success) {
        return { success: true };
      }
      
      // Convert Zod errors to form errors
      const formErrors: FormErrors = {};
      result.error.errors.forEach(err => {
        const path = err.path.join('.');
        formErrors[path] = err.message;
      });
      
      // Update form errors
      set(state => {
        if (state.forms[formId]) {
          state.forms[formId].errors = formErrors;
          state.forms[formId].isValid = false;
        }
      });
      
      return { success: false, errors: formErrors };
    },
    
    // Selector to get form state
    getForm: (formId) => {
      return get().forms[formId];
    },
  }))
);

// Helper to create a form with schema
export function createForm(formId: FormId, schema: z.ZodType<any>, initialValues: FormValues = {}) {
  const formStore = useFormStore.getState();
  formStore.initForm(formId, initialValues);
  formStore.registerSchema(formId, schema);
  return formId;
}

// Hook to integrate with React Hook Form
export function useZodForm<T extends z.ZodType<any>>(
  formId: FormId, 
  schema: T,
  defaultValues: z.infer<T> = {} as z.infer<T>
) {
  // Register schema if not already registered
  const { registerSchema, getForm, setFormValues, validateWithSchema } = useFormStore();
  
  // Initialize form if not exists
  if (!getForm(formId)) {
    useFormStore.getState().initForm(formId, defaultValues);
    registerSchema(formId, schema);
  }
  
  return {
    formId,
    schema,
    defaultValues,
    
    // Methods to connect with React Hook Form
    setValue: (name: string, value: any) => {
      useFormStore.getState().setFormValue(formId, name, value);
    },
    
    setValues: (values: Partial<z.infer<T>>) => {
      setFormValues(formId, values as FormValues);
    },
    
    validate: () => {
      return validateWithSchema(formId);
    },
    
    // Get current form state
    getState: () => getForm(formId),
    
    // Reset form
    reset: (values?: Partial<z.infer<T>>) => {
      useFormStore.getState().resetForm(formId);
      if (values) {
        useFormStore.getState().setFormValues(formId, values as FormValues);
      }
    },
    
    // Connect to React Hook Form
    connect: () => {
      const form = getForm(formId);
      return {
        values: form?.values || defaultValues,
        formState: {
          errors: form?.errors || {},
          isSubmitting: form?.isSubmitting || false,
          isValid: form?.isValid || true,
          isDirty: form?.isDirty || false,
        }
      };
    }
  };
} 