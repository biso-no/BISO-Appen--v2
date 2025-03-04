import { z } from 'zod';

// Attachment schema
export const attachmentSchema = z.object({
  url: z.string().url('Please provide a valid URL'),
  description: z.string().min(1, 'Description is required'),
  date: z.date().or(z.string().transform(val => new Date(val))),
  amount: z.number().min(0, 'Amount must be a positive number'),
  type: z.enum(['pdf', 'png', 'jpg', 'jpeg', 'webp', 'heic']),
});

// Expense schema for form validation
export const expenseFormSchema = z.object({
  bank_account: z.string().min(1, 'Bank account information is required'),
  user: z.string().min(1, 'User is required'),
  campus: z.string().min(1, 'Campus is required'),
  department: z.string().min(1, 'Department is required'),
  expenseAttachments: z.array(attachmentSchema).min(1, 'At least one attachment is required'),
  description: z.string().min(10, 'Please provide a detailed description (minimum 10 characters)'),
  prepayment_amount: z.number().default(0),
  total: z.number().min(0.01, 'Total amount must be greater than zero'),
  status: z.enum(['draft', 'pending', 'approved', 'rejected']).default('draft'),
  eventName: z.string().optional().default('')
});

// Extended schema for database records
export const expenseSchema = expenseFormSchema.extend({
  $id: z.string().optional(),
  userId: z.string().optional(),
  user: z.string().optional(),
  created: z.string().optional(),
  eventName: z.string().optional(),
});

// Schema for step 1: Payment details
export const paymentDetailsSchema = z.object({
  bank_account: z.string().min(1, 'Bank account information is required'),
  prepayment_amount: z.number().default(0),
});

// Schema for step 2: Department info
export const departmentInfoSchema = z.object({
  campus: z.string().min(1, 'Campus is required'),
  department: z.string().min(1, 'Department is required'),
});

// Schema for step 3: Expense attachments
export const attachmentsSchema = z.object({
  expenseAttachments: z.array(attachmentSchema).min(1, 'At least one attachment is required'),
});

// Schema for step 4: Event info (optional)
export const eventInfoSchema = z.object({
  forEvent: z.boolean().default(false),
  eventName: z.string().optional().nullable(),
});

// Schema for step 5: Description and review
export const descriptionSchema = z.object({
  description: z.string().min(10, 'Please provide a detailed description (minimum 10 characters)'),
  total: z.number().min(0.01, 'Total amount must be greater than zero'),
});

// Type definitions
export type ExpenseFormData = z.infer<typeof expenseFormSchema>;
export type ExpenseData = z.infer<typeof expenseSchema>;
export type AttachmentData = z.infer<typeof attachmentSchema>;

// Utility function to validate specific steps
export function validateStep(
  step: number, 
  data: Partial<ExpenseData>
): { success: boolean; errors?: Record<string, string> } {
  try {
    switch (step) {
      case 1:
        paymentDetailsSchema.parse(data);
        break;
      case 2:
        departmentInfoSchema.parse(data);
        break;
      case 3:
        attachmentsSchema.parse(data);
        break;
      case 4:
        // Event info is optional
        eventInfoSchema.parse(data);
        break;
      case 5:
        descriptionSchema.parse(data);
        break;
      default:
        return { success: false, errors: { form: 'Invalid step' } };
    }
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(err => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { form: 'Invalid data' } };
  }
} 