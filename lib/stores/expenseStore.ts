import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ID, Models } from 'react-native-appwrite';
import { createDocument, updateDocument, uploadFile, storage, databases } from '@/lib/appwrite';
import { devtools } from 'zustand/middleware';

export interface Attachment {
  url: string;
  description: string;
  date: Date;
  amount: number;
  type: 'pdf' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'heic';
}

export interface Expense {
  $id?: string;
  bank_account: string;
  campus: string;
  department: string;
  expenseAttachments: Attachment[];
  description: string;
  prepayment_amount: number;
  total: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  userId?: string;
  user?: string;
  created?: string;
  eventName?: string;
}

interface ExpenseState {
  // Current expense being created or edited
  currentExpense: Expense | null;
  
  // Form state
  formStep: number;
  isProcessing: boolean;
  receivedPrepayment: boolean;
  selectedCampus: Models.Document | null;
  selectedDepartment: Models.Document | null;
  forEvent: boolean;
  eventName: string;
  
  // Expenses list
  expenses: Expense[];
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  setCurrentExpense: (expense: Expense | null) => void;
  updateExpenseField: <K extends keyof Expense>(field: K, value: Expense[K]) => void;
  setAttachments: (attachments: Attachment[]) => void;
  addAttachment: (attachment: Attachment) => void;
  removeAttachment: (index: number) => void;
  
  setReceivedPrepayment: (received: boolean) => void;
  setSelectedCampus: (campus: Models.Document | null) => void;
  setSelectedDepartment: (department: Models.Document | null) => void;
  setForEvent: (forEvent: boolean) => void;
  setEventName: (name: string) => void;
  
  setIsProcessing: (isProcessing: boolean) => void;
  
  // Create new expense
  createExpense: (userId: string) => Promise<Expense | null>;
  saveDraft: (userId: string) => Promise<Expense | null>;
  
  // Initialize expense form
  initExpenseForm: (profile?: Models.Document | null) => void;
  resetForm: () => void;
}

export const useExpenseStore = create<ExpenseState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      currentExpense: null,
      formStep: 1,
      isProcessing: false,
      receivedPrepayment: false,
      selectedCampus: null,
      selectedDepartment: null,
      forEvent: false,
      eventName: '',
      
      expenses: [],
      isLoading: false,
      error: null,
      
      // Step navigation
      setStep: (step) => set(state => {
        state.formStep = step;
      }),
      
      nextStep: () => set(state => {
        state.formStep = Math.min(state.formStep + 1, 5);
      }),
      
      prevStep: () => set(state => {
        state.formStep = Math.max(state.formStep - 1, 1);
      }),
      
      // Expense management
      setCurrentExpense: (expense) => set(state => {
        state.currentExpense = expense;
      }),
      
      updateExpenseField: (field, value) => set(state => {
        if (state.currentExpense) {
          state.currentExpense[field] = value;
        }
      }),
      
      setAttachments: (attachments) => set(state => {
        if (state.currentExpense) {
          state.currentExpense.expenseAttachments = attachments;
          
          // Recalculate total amount
          state.currentExpense.total = attachments.reduce(
            (sum, attachment) => sum + attachment.amount, 0
          );
        }
      }),
      
      addAttachment: (attachment) => set(state => {
        if (state.currentExpense) {
          state.currentExpense.expenseAttachments.push(attachment);
          
          // Recalculate total amount
          state.currentExpense.total = state.currentExpense.expenseAttachments.reduce(
            (sum, attachment) => sum + attachment.amount, 0
          );
        }
      }),
      
      removeAttachment: (index) => set(state => {
        if (state.currentExpense && state.currentExpense.expenseAttachments.length > index) {
          state.currentExpense.expenseAttachments.splice(index, 1);
          
          // Recalculate total amount
          state.currentExpense.total = state.currentExpense.expenseAttachments.reduce(
            (sum, attachment) => sum + attachment.amount, 0
          );
        }
      }),
      
      // Form state management
      setReceivedPrepayment: (received) => set(state => {
        state.receivedPrepayment = received;
        if (!received && state.currentExpense) {
          state.currentExpense.prepayment_amount = 0;
        }
      }),
      
      setSelectedCampus: (campus) => set(state => {
        state.selectedCampus = campus;
        if (state.currentExpense) {
          state.currentExpense.campus = campus?.name ?? '';
          // Reset department when campus changes
          state.currentExpense.department = '';
          state.selectedDepartment = null;
        }
      }),
      
      setSelectedDepartment: (department) => set(state => {
        state.selectedDepartment = department;
        if (state.currentExpense && department) {
          state.currentExpense.department = department.Name || department.name || '';
        }
      }),
      
      setForEvent: (forEvent) => set(state => {
        state.forEvent = forEvent;
        if (!forEvent) {
          state.eventName = '';
        }
      }),
      
      setEventName: (name) => set(state => {
        state.eventName = name;
      }),
      
      setIsProcessing: (isProcessing) => set(state => {
        state.isProcessing = isProcessing;
      }),
      
      // Submit operations
      createExpense: async (userId) => {
        const { currentExpense, setIsProcessing } = get();
        
        if (!currentExpense) return null;
        
        try {
          setIsProcessing(true);
          
          // Upload attachments first and get their URLs
          const updatedAttachments = await Promise.all(
            currentExpense.expenseAttachments.map(async (attachment) => {
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
            })
          );
          
          // Create the expense document with updated attachment URLs
          const newExpense = await createDocument('expense', {
            ...currentExpense,
            expenseAttachments: updatedAttachments,
            status: 'pending',
            userId,
            user: userId
          });
          
          setIsProcessing(false);
          return newExpense as unknown as Expense;
        } catch (error) {
          console.error('Error creating expense:', error);
          setIsProcessing(false);
          return null;
        }
      },
      
      saveDraft: async (userId) => {
        const { currentExpense, setIsProcessing } = get();
        
        if (!currentExpense || !userId) return null;
        
        try {
          setIsProcessing(true);
          
          const updatedExpense = {
            ...currentExpense,
            status: 'draft',
          };
          
          // Save as a draft in the user's profile
          const result = await updateDocument('user', userId, {
            expenses: [updatedExpense],
          });
          
          setIsProcessing(false);
          return updatedExpense as Expense;
        } catch (error) {
          console.error('Error saving draft:', error);
          setIsProcessing(false);
          return null;
        }
      },
      
      // Initialize form with profile data
      initExpenseForm: (profile) => set(state => {
        state.currentExpense = {
          bank_account: profile?.bank_account || "",
          campus: profile?.campus || "",
          department: profile?.department || "",
          expenseAttachments: [],
          description: "",
          prepayment_amount: 0,
          total: 0,
          status: "draft"
        };
        
        // Initialize form state based on profile
        if (profile?.campus) {
          // Ideally you'd fetch the campus document object here
          // This is a placeholder
        }
        
        state.formStep = 1;
        state.receivedPrepayment = false;
      }),
      
      resetForm: () => set(state => {
        state.currentExpense = {
          bank_account: state.currentExpense?.bank_account || "",
          campus: state.selectedCampus?.name || "",
          department: state.selectedDepartment?.name || "",
          expenseAttachments: [],
          description: "",
          prepayment_amount: 0,
          total: 0,
          status: "draft"
        };
        
        state.formStep = 1;
        state.receivedPrepayment = false;
        state.forEvent = false;
        state.eventName = '';
      })
    }))
  )
);

// Helper functions
async function uriToBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      reject(new Error('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
} 