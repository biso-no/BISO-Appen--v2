import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ID, Models, Query } from 'react-native-appwrite';
import { databases, storage, createDocument, updateDocument, getDocuments, listDocuments } from '@/lib/appwrite';
import { useExpenseStore, Expense, Attachment } from '@/lib/stores/expenseStore';
import { useAuthStore } from '@/lib/stores/authStore';

// Query keys
export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters: string[]) => [...expenseKeys.lists(), { filters }] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
};

// Helper function to convert blob to File object
async function uriToBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function () {
      reject(new Error('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}

// Function to upload an attachment
export async function uploadAttachment(attachment: Attachment) {
  try {
    const fileId = ID.unique();
    const blob = await uriToBlob(attachment.url);
    
    const customFile = {
      name: attachment.description,
      type: blob.type,
      size: blob.size,
      uri: attachment.url,
    };
    
    const uploadResult = await storage.createFile('expenses', fileId, customFile);
    const downloadUrl = `https://appwrite.biso.no/v1/storage/buckets/expenses/files/${uploadResult.$id}/view?project=biso`;
    
    return {
      ...attachment,
      url: downloadUrl,
    };
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw error;
  }
}

// Main hook for expense operations
export function useExpenses() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(state => state.user?.$id);
  
  // Get expenses from Zustand store
  const expenseStore = useExpenseStore();
  
  // Query for fetching all expenses for the current user
  const expensesQuery = useQuery({
    queryKey: expenseKeys.lists(),
    queryFn: async () => {
      if (!userId) return { documents: [] as Models.Document[] };
      
      try {
        // Query for all expenses where the user is the owner
        const result = await listDocuments('expense', [
          Query.equal('userId', userId),
        ]);
        
        // Update the Zustand store with the fetched expenses
        expenseStore.expenses = result.documents as unknown as Expense[];
        
        return result;
      } catch (error) {
        console.error('Error fetching expenses:', error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Mutation for creating a new expense
  const createExpenseMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !expenseStore.currentExpense) {
        throw new Error('User ID or expense data missing');
      }
      
      try {
        expenseStore.setIsProcessing(true);
        
        // Upload attachments first and get their URLs
        const updatedAttachments = await Promise.all(
          expenseStore.currentExpense.expenseAttachments.map(uploadAttachment)
        );
        
        // Create the expense document with updated attachment URLs
        const newExpenseData = {
          ...expenseStore.currentExpense,
          expenseAttachments: updatedAttachments,
          status: 'pending',
          userId,
          user: userId,
        };
        
        const documentId = ID.unique();
        const newExpense = await createDocument('expense', newExpenseData, documentId);
        
        return newExpense as unknown as Expense;
      } catch (error) {
        console.error('Error creating expense:', error);
        throw error;
      } finally {
        expenseStore.setIsProcessing(false);
      }
    },
    onSuccess: (data) => {
      // Invalidate queries to refetch expenses
      queryClient.invalidateQueries({
        queryKey: expenseKeys.lists()
      });
      
      // Reset form
      expenseStore.resetForm();
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    }
  });
  
  // Mutation for saving a draft expense
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !expenseStore.currentExpense) {
        throw new Error('User ID or expense data missing');
      }
      
      try {
        expenseStore.setIsProcessing(true);
        
        const updatedExpense = {
          ...expenseStore.currentExpense,
          status: 'draft',
        };
        
        // Save as a draft in the user's profile
        const result = await updateDocument('user', userId, {
          expenses: [updatedExpense],
        });
        
        return updatedExpense as Expense;
      } catch (error) {
        console.error('Error saving draft:', error);
        throw error;
      } finally {
        expenseStore.setIsProcessing(false);
      }
    }
  });
  
  // Mutation for generating expense descriptions via AI
  const generateDescriptionMutation = useMutation({
    mutationFn: async ({ descriptions, eventName }: { descriptions: string, eventName: string }) => {
      try {
        expenseStore.setIsProcessing(true);
        
        // Call your AI function to generate a description
        const body = { 
          descriptions, 
          event: eventName ? `for ${eventName}` : '' 
        };
        
        const result = await fetch('https://appwrite.biso.no/v1/functions/generate_expense_description/executions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': 'biso'
          },
          body: JSON.stringify(body)
        });
        
        const data = await result.json();
        return data.description;
      } catch (error) {
        console.error('Error generating description:', error);
        throw error;
      } finally {
        expenseStore.setIsProcessing(false);
      }
    },
    onSuccess: (description) => {
      if (description && expenseStore.currentExpense) {
        expenseStore.updateExpenseField('description', description);
      }
    }
  });
  
  return {
    // Queries
    expenses: expensesQuery.data?.documents as unknown as Expense[],
    isLoading: expensesQuery.isLoading,
    isError: expensesQuery.isError,
    error: expensesQuery.error,
    
    // Mutations
    createExpense: createExpenseMutation.mutate,
    isCreating: createExpenseMutation.isPending,
    
    saveDraft: saveDraftMutation.mutate,
    isSavingDraft: saveDraftMutation.isPending,
    
    generateDescription: generateDescriptionMutation.mutate,
    isGeneratingDescription: generateDescriptionMutation.isPending,
    
    // Form state (from Zustand)
    form: {
      currentExpense: expenseStore.currentExpense,
      formStep: expenseStore.formStep,
      receivedPrepayment: expenseStore.receivedPrepayment,
      selectedCampus: expenseStore.selectedCampus,
      selectedDepartment: expenseStore.selectedDepartment,
      forEvent: expenseStore.forEvent,
      eventName: expenseStore.eventName,
      isProcessing: expenseStore.isProcessing,
    },
    
    // Form actions (from Zustand)
    actions: {
      setStep: expenseStore.setStep,
      nextStep: expenseStore.nextStep,
      prevStep: expenseStore.prevStep,
      setCurrentExpense: expenseStore.setCurrentExpense,
      updateExpenseField: expenseStore.updateExpenseField,
      setAttachments: expenseStore.setAttachments,
      addAttachment: expenseStore.addAttachment,
      removeAttachment: expenseStore.removeAttachment,
      setReceivedPrepayment: expenseStore.setReceivedPrepayment,
      setSelectedCampus: expenseStore.setSelectedCampus,
      setSelectedDepartment: expenseStore.setSelectedDepartment,
      setForEvent: expenseStore.setForEvent,
      setEventName: expenseStore.setEventName,
      initExpenseForm: expenseStore.initExpenseForm,
      resetForm: expenseStore.resetForm,
    },
    
    // Query utilities
    refetch: expensesQuery.refetch,
  };
} 