import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  YStack, XStack, Stack, ScrollView, Button, Text, H2, H3, Paragraph,
  Image, Card, Switch, useTheme, styled, Input, TextArea, Spinner,
  Separator, Sheet, Popover, View
} from 'tamagui';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Camera, Upload, ChevronLeft, ChevronRight,
  Edit3 as Edit, Check, Info, AlertCircle, X
} from '@tamagui/lucide-icons';
import { launchCameraAsync, launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import MlkitOcr from 'react-native-mlkit-ocr';
import * as DocumentPicker from 'expo-document-picker';
import { useProfile } from '@/components/context/core/profile-provider';
import { useProfileStore } from '@/lib/stores/profileStore';
import { MotiView, AnimatePresence } from 'moti';
import { useColorScheme, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, Platform, Dimensions, TextInput } from 'react-native';
import { triggerFunction } from '@/lib/appwrite';
import { Attachment } from '@/lib/stores/expenseStore';
import { FileIcon } from '@/components/ui/file-icon';
import { create } from 'zustand';
import { CustomSelect } from '@/components/ui/select';
import { CustomSwitch } from '@/components/custom-switch';
import CampusSelector from '@/components/SelectCampus';
import { Models, Query, ID } from 'react-native-appwrite';
import { databases, storage } from '@/lib/appwrite';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Define supported file types
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];

// Create a zustand store for handling form progress and data
interface ExpenseFormState {
  // Current view/section
  currentView: 'profile' | 'attachments' | 'details' | 'review';
  setCurrentView: (view: 'profile' | 'attachments' | 'details' | 'review') => void;
  
  // Form data
  fullName: string;
  address: string;
  zipAndCity: string;
  phoneNumber: string;
  bankAccount: string;
  
  // Profile editing mode
  editingProfile: boolean;
  setEditingProfile: (editing: boolean) => void;
  
  // Attachments
  attachments: Attachment[];
  addAttachment: (attachment: Attachment) => void;
  removeAttachment: (index: number) => void;
  updateAttachment: (index: number, attachment: Attachment) => void;
  
  // Department and campus
  campus: string | null;
  department: string | null;
  setCampus: (campus: string | null) => void;
  setDepartment: (department: string | null) => void;
  
  // General description
  generalDescription: string;
  setGeneralDescription: (description: string) => void;
  
  // Event information
  eventName: string;
  setEventName: (event: string) => void;
  
  // AI processing
  aiEnabled: boolean;
  setAiEnabled: (enabled: boolean) => void;
  
  // Loading state
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  
  // Form completion check
  isProfileComplete: () => boolean;
  isAttachmentsComplete: () => boolean;
  isDetailsComplete: () => boolean;
  
  // Reset form
  resetForm: () => void;
}

// Create the store
const useExpenseForm = create<ExpenseFormState>((set, get) => ({
  currentView: 'profile',
  setCurrentView: (view) => set({ currentView: view }),
  
  fullName: '',
  address: '',
  zipAndCity: '',
  phoneNumber: '',
  bankAccount: '',
  
  editingProfile: false,
  setEditingProfile: (editing) => set({ editingProfile: editing }),
  
  attachments: [],
  addAttachment: (attachment) => set(state => ({ 
    attachments: [...state.attachments, attachment] 
  })),
  removeAttachment: (index) => set(state => ({ 
    attachments: state.attachments.filter((_, i) => i !== index) 
  })),
  updateAttachment: (index, attachment) => set(state => {
    const newAttachments = [...state.attachments];
    newAttachments[index] = attachment;
    return { attachments: newAttachments };
  }),
  
  campus: null,
  department: null,
  setCampus: (campus) => set({ campus, department: null }), // Reset department when campus changes
  setDepartment: (department) => set({ department }),
  
  generalDescription: '',
  setGeneralDescription: (description) => set({ generalDescription: description }),
  
  eventName: '',
  setEventName: (event) => set({ eventName: event }),
  
  aiEnabled: false,
  setAiEnabled: (enabled) => set({ aiEnabled: enabled }),
  
  isProcessing: false,
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  
  isProfileComplete: () => {
    const { fullName, address, zipAndCity, phoneNumber, bankAccount } = get();
    return Boolean(fullName && address && zipAndCity && phoneNumber && bankAccount);
  },
  
  isAttachmentsComplete: () => {
    return get().attachments.length > 0;
  },
  
  isDetailsComplete: () => {
    const { campus, department, generalDescription } = get();
    return Boolean(campus && department && generalDescription);
  },
  
  resetForm: () => set({
    currentView: 'profile',
    editingProfile: false,
    attachments: [],
    campus: null,
    department: null,
    generalDescription: '',
    eventName: '',
    aiEnabled: false,
    isProcessing: false
  })
}));

// Mock campuses and departments for development
const CAMPUSES = [
  { id: '1', name: 'Bergen' },
  { id: '2', name: 'Oslo' },
  { id: '3', name: 'Stavanger' },
  { id: '4', name: 'Trondheim' },
  { id: '5', name: 'National' }
];


// Styled components for a more modern UI
const AnimatedCard = styled(Card, {
  borderRadius: 24,
  elevation: 4,
  shadowColor: '$gray12',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  overflow: 'hidden',
  marginVertical: 8,
  marginHorizontal: 0,
  variants: {
    active: {
      true: {
        borderColor: '$blue9',
        borderWidth: 2,
      },
      false: {
        borderColor: '$gray4',
        borderWidth: 1,
      }
    }
  } as const
});

const ActionButton = styled(Button, {
  borderRadius: 16,
  height: 52,
  marginVertical: 8,
  backgroundColor: '$blue9',
  shadowColor: '$blue8',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  variants: {
    variant: {
      primary: {
        backgroundColor: '$blue9',
      },
      secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$blue9',
      },
      success: {
        backgroundColor: '$green9',
      },
      danger: {
        backgroundColor: '$red9',
      }
    }
  } as const
});

const ProgressIndicator = styled(Stack, {
  height: 4,
  borderRadius: 2,
  variants: {
    active: {
      true: {
        backgroundColor: '$blue9',
      },
      false: {
        backgroundColor: '$gray4',
      }
    }
  } as const
});

const AttachmentCard = styled(Card, {
  marginVertical: 8,
  borderRadius: 12,
  borderWidth: 1,
  padding: '$3',
});

// Function to process image with AI
const processImageWithAI = async (imageUri: string) => {
  try {
    const ocrResult = await MlkitOcr.detectFromUri(imageUri);
    if (!ocrResult || ocrResult.length === 0) {
      throw new Error("OCR processing failed - no text detected");
    }
    
    const extractedText = ocrResult.map(block => block.text).join(' ');
    if (!extractedText.trim()) {
      throw new Error("No text content detected in the image");
    }
    
    const functionResults = await triggerFunction({
      functionId: 'process_receipts',
      data: extractedText,
      async: false,
    });
    
    if (functionResults.responseBody) {
      const data = JSON.parse(functionResults.responseBody);
      return {
        description: data.description || '',
        date: data.date ? new Date(data.date) : new Date(),
        amount: data.amount || 0,
        currency: data.currency || 'NOK',
        exchangeRate: data.exchangeRate,
        nokAmount: data.nokAmount
      };
    }
    
    throw new Error("AI processing returned empty results");
  } catch (error) {
    console.error('Error processing image with AI:', error);
    throw error; // Re-throw to handle in the calling function
  }
};

// Function to generate expense description using AI
const generateExpenseDescription = async (attachments: Attachment[], eventName: string) => {
  try {
    // Extract descriptions from all attachments
    const descriptions = attachments.map(attachment => attachment.description);
    
    // Prepare data for the function
    const data = JSON.stringify({
      descriptions,
      event: eventName || null
    });
    
    // Call the Appwrite function
    const functionResults = await triggerFunction({
      functionId: 'generate_expense_description',
      data,
      async: false,
    });
    
    if (functionResults.responseBody) {
      const result = JSON.parse(functionResults.responseBody);
      if (result.description) {
        return result.description;
      }
      throw new Error("No description generated");
    }
    
    throw new Error("AI description generation returned empty results");
  } catch (error) {
    console.error('Error generating expense description:', error);
    throw error;
  }
};

// Main component
export default function NewExpenseScreen() {
  const router = useRouter();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { profile } = useProfile();
  const profileStore = useProfileStore();
  const scrollViewRef = useRef(null);
  const { height: windowHeight } = Dimensions.get('window');
  
  // Add state for keyboard visibility
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Access the expense form store
  const {
    currentView, setCurrentView,
    fullName, address, zipAndCity, phoneNumber, bankAccount,
    editingProfile, setEditingProfile,
    attachments, addAttachment, removeAttachment, updateAttachment,
    campus, department, setCampus, setDepartment,
    generalDescription, setGeneralDescription,
    eventName, setEventName,
    aiEnabled, setAiEnabled,
    isProcessing, setIsProcessing,
    isProfileComplete, isAttachmentsComplete, isDetailsComplete,
    resetForm
  } = useExpenseForm();
  
  // Add state for departments
  const [departments, setDepartments] = useState<Models.Document[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // Initialize profile data from the user's profile
  useEffect(() => {
    if (profile) {
      useExpenseForm.setState({
        fullName: profile.name || '',
        address: profile.address || '',
        zipAndCity: profile.zip && profile.city ? `${profile.zip}, ${profile.city}` : '',
        phoneNumber: profile.phone || '',
        bankAccount: profile.bank_account || ''
      });
    }
  }, [profile]);
  
  // Local states
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);
  const [selectedFileUri, setSelectedFileUri] = useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<string | null>(null);
  const [tempAttachment, setTempAttachment] = useState<Partial<Attachment> | null>(null);
  const [editingAttachmentIndex, setEditingAttachmentIndex] = useState<number | null>(null);
  const [showInfoDetails, setShowInfoDetails] = useState(false);
  
  // Add loading and error states
  const [cameraLoading, setCameraLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add this to the state declarations at the top
  const [aiProcessingStep, setAiProcessingStep] = useState(0);
  
  // Add a new state to track the type of AI processing
  const [aiProcessingType, setAiProcessingType] = useState<'receipt' | 'description'>('receipt');
  
  // Add a new state to track success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Add refs for input fields with proper types
  const fullNameInputRef = useRef<TextInput>(null);
  const addressInputRef = useRef<TextInput>(null);
  const zipCityInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const bankAccountInputRef = useRef<TextInput>(null);
  
  // Add refs for other form views
  const eventNameInputRef = useRef<TextInput>(null);
  const searchInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  
  // Add refs for attachment sheet
  const attachmentDescriptionRef = useRef<TextInput>(null);
  const attachmentAmountRef = useRef<TextInput>(null);
  
  // Replace with this much simpler version that DOESN'T auto-dismiss
  useEffect(() => {
    // Simple keyboard listeners without any auto-dismiss
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );
    
    // Clean up listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Function to clear error after a timeout
  const clearErrorAfterDelay = () => {
    setTimeout(() => {
      setError(null);
    }, 5000);
  };
  
  // Toggle AI assistance
  const toggleAI = () => {
    setAiEnabled(!aiEnabled);
  };
  
  // Function to handle starting AI processing
  const startAiProcessing = (type: 'receipt' | 'description' = 'receipt') => {
    setIsProcessing(true);
    setAiProcessingType(type);
    // Start the rotating messages for AI processing
    setAiProcessingStep(0);
    const intervalId = setInterval(() => {
      setAiProcessingStep(prev => (prev + 1) % 5);
    }, 2500);
    
    // Store the interval ID somewhere to clear later
    return intervalId;
  };
  
  // Function to stop AI processing and clear interval
  const stopAiProcessing = (intervalId: NodeJS.Timeout) => {
    clearInterval(intervalId);
    setIsProcessing(false);
  };
  
  // Capture image with camera
  const captureImage = async () => {
    try {
      setError(null);
      setCameraLoading(true);
      
      const result = await launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSelectedFileUri(uri);
        setSelectedFileType('image/jpeg');
        
        if (aiEnabled) {
          const intervalId = startAiProcessing('receipt');
          try {
            const aiData = await processImageWithAI(uri);
            
            if (aiData) {
              setTempAttachment({
                url: uri,
                type: 'jpeg',
                ...aiData
              });
            } else {
              setTempAttachment({
                url: uri,
                type: 'jpeg',
                description: '',
                date: new Date(),
                amount: 0
              });
            }
          } catch (aiError) {
            setError("AI processing failed. Please fill details manually.");
            clearErrorAfterDelay();
            
            setTempAttachment({
              url: uri,
              type: 'jpeg',
              description: '',
              date: new Date(),
              amount: 0
            });
          } finally {
            stopAiProcessing(intervalId);
          }
        } else {
          setTempAttachment({
            url: uri,
            type: 'jpeg',
            description: '',
            date: new Date(),
            amount: 0
          });
        }
        
        setShowAttachmentSheet(true);
      } else if (!result.canceled) {
        setError("No image captured. Please try again.");
        clearErrorAfterDelay();
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      setError("Failed to access camera. Please check permissions and try again.");
      clearErrorAfterDelay();
    } finally {
      setCameraLoading(false);
    }
  };
  
  // Pick image from library
  const pickImage = async () => {
    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSelectedFileUri(uri);
        setSelectedFileType('image/jpeg');
        
        if (aiEnabled) {
          setIsProcessing(true);
          const aiData = await processImageWithAI(uri);
          setIsProcessing(false);
          
          if (aiData) {
            setTempAttachment({
              url: uri,
              type: 'jpeg',
              ...aiData
            });
          } else {
            setTempAttachment({
              url: uri,
              type: 'jpeg',
              description: '',
              date: new Date(),
              amount: 0
            });
          }
        } else {
          setTempAttachment({
            url: uri,
            type: 'jpeg',
            description: '',
            date: new Date(),
            amount: 0
          });
        }
        
        setShowAttachmentSheet(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };
  
  // Pick document
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: SUPPORTED_TYPES,
        copyToCacheDirectory: true,
      });
      
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFileUri(asset.uri);
        setSelectedFileType(asset.mimeType || 'application/pdf');
        
        // PDFs can't be processed with OCR directly, so skip AI processing
        const fileExt = asset.mimeType?.split('/')[1] || 'pdf';
        
        setTempAttachment({
          url: asset.uri,
          type: fileExt as 'pdf' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'heic',
          description: '',
          date: new Date(),
          amount: 0
        });
        
        setShowAttachmentSheet(true);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };
  
  // Combined function to pick a file or image
  const pickFileOrImage = async () => {
    try {
      setError(null);
      setUploadLoading(true);
      
      // First try to pick any document (including images)
      const result = await DocumentPicker.getDocumentAsync({
        type: SUPPORTED_TYPES,
        copyToCacheDirectory: true,
      });
      
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFileUri(asset.uri);
        setSelectedFileType(asset.mimeType || 'application/pdf');
        
        const isImage = asset.mimeType?.startsWith('image/') || false;
        const fileExt = asset.mimeType?.split('/')[1] || 'pdf';
        
        // Process with AI if it's an image and AI is enabled
        if (isImage && aiEnabled) {
          const intervalId = startAiProcessing('receipt');
          try {
            const aiData = await processImageWithAI(asset.uri);
            
            if (aiData) {
              setTempAttachment({
                url: asset.uri,
                type: fileExt as 'pdf' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'heic',
                ...aiData
              });
            } else {
              setTempAttachment({
                url: asset.uri,
                type: fileExt as 'pdf' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'heic',
                description: '',
                date: new Date(),
                amount: 0
              });
            }
          } catch (aiError) {
            setError("AI processing failed. Please fill details manually.");
            clearErrorAfterDelay();
            
            setTempAttachment({
              url: asset.uri,
              type: fileExt as 'pdf' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'heic',
              description: '',
              date: new Date(),
              amount: 0
            });
          } finally {
            stopAiProcessing(intervalId);
          }
        } else {
          setTempAttachment({
            url: asset.uri,
            type: fileExt as 'pdf' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'heic',
            description: '',
            date: new Date(),
            amount: 0
          });
        }
        
        setShowAttachmentSheet(true);
      } else {
        setError("No file selected. Please try again.");
        clearErrorAfterDelay();
      }
    } catch (error) {
      console.error('Error picking file or image:', error);
      setError("Failed to select file. Please check permissions and try again.");
      clearErrorAfterDelay();
    } finally {
      setUploadLoading(false);
    }
  };
  
  // Save attachment from the sheet
  const saveAttachment = () => {
    Keyboard.dismiss();
    if (!tempAttachment?.url || !tempAttachment.description) return;
    
    const fullAttachment: Attachment = {
      url: tempAttachment.url,
      description: tempAttachment.description || '',
      date: tempAttachment.date || new Date(),
      amount: tempAttachment.amount || 0,
      type: tempAttachment.type || 'jpeg',
      ...(tempAttachment.currency && { currency: tempAttachment.currency }),
      ...(tempAttachment.exchangeRate && { exchangeRate: tempAttachment.exchangeRate }),
      ...(tempAttachment.nokAmount && { nokAmount: tempAttachment.nokAmount })
    };
    
    if (editingAttachmentIndex !== null) {
      updateAttachment(editingAttachmentIndex, fullAttachment);
    } else {
      addAttachment(fullAttachment);
    }
    
    // Reset and close
    setTempAttachment(null);
    setSelectedFileUri(null);
    setSelectedFileType(null);
    setEditingAttachmentIndex(null);
    setShowAttachmentSheet(false);
  };
  
  // Edit an attachment
  const editAttachment = (index: number) => {
    const attachment = attachments[index];
    setTempAttachment(attachment);
    setSelectedFileUri(attachment.url);
    setEditingAttachmentIndex(index);
    setShowAttachmentSheet(true);
  };
  
  // Submit form
  const handleSubmit = async () => {
    // Dismiss keyboard first to ensure UI is in the right state
    Keyboard.dismiss();
    
    if (!isProfileComplete() || !isAttachmentsComplete() || !isDetailsComplete()) {
      return;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // Store attachments and create expense document
      const attachmentPromises = [];
      
      // Process each attachment
      for (const attachment of attachments) {
        const fileExt = attachment.type;
        const fileId = ID.unique(); // Let Appwrite generate the ID
        
        // Create a promise for each attachment upload and database creation
        const attachmentPromise = (async () => {
          try {
            // Step 1: For ReactNative, we need to use the file URI directly
            // Determine mime type based on the file extension
            let mimeType = '';
            if (fileExt === 'pdf') {
              mimeType = 'application/pdf';
            } else {
              // For images
              mimeType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
            }
            
            // Create the file in storage
            const fileUpload = await storage.createFile(
              'expenses', // bucket ID
              fileId,
              {
                uri: attachment.url,
                name: `expense_${fileId}.${fileExt}`, 
                type: mimeType,
                size: 0 // Size will be determined by the SDK
              }
            );
            
            // Get the file URL
            const fileUrl = storage.getFileView('expenses', fileUpload.$id);
            
            // Step 2: Create expense attachment document
            const attachmentDoc = await databases.createDocument(
              'app',
              'expense_attachments',
              ID.unique(),
              {
                date: new Date(attachment.date).toISOString(),
                url: fileUrl.href,
                amount: attachment.nokAmount || attachment.amount,
                description: attachment.description,
                type: attachment.type
              }
            );
            
            return attachmentDoc.$id;
          } catch (error) {
            console.error('Error processing attachment:', error);
            // Specific error handling for common Appwrite errors
            if (error instanceof Error) {
              if (error.message.includes('File size exceeds maximum allowed')) {
                throw new Error(`File size too large: ${attachment.description}`);
              } else if (error.message.includes('Unsupported file type')) {
                throw new Error(`Unsupported file type: ${fileExt}`);
              }
            }
            throw error;
          }
        })();
        
        attachmentPromises.push(attachmentPromise);
      }
      
      try {
        // Wait for all attachments to be processed
        const attachmentIds = await Promise.all(attachmentPromises);
        
        // Calculate total amount
        const totalAmount = attachments.reduce((sum, item) => {
          return sum + (item.nokAmount || item.amount);
        }, 0);
        
        // Create the main expense document
        const expenseData = {
          campus: campus,
          department: department,
          bank_account: bankAccount,
          description: generalDescription,
          expenseAttachments: attachmentIds,
          total: totalAmount,
          prepayment_amount: 0, // default value
          status: 'pending', // default status
          user: profile?.$id || '', // Use profile ID from context
          userId: profile?.$id || '', // Use profile ID from context
          ...(eventName && { eventName }) // Add eventName if it exists
        };
        
        const expenseDoc = await databases.createDocument(
          'app',
          'expense',
          ID.unique(),
          expenseData
        );
        
        setIsProcessing(false);
        
        // Show success message
        setSuccessMessage('Expense submitted successfully!');
        
        // Reset form after a short delay to show success message
        setTimeout(() => {
          resetForm();
          router.replace('/explore/expenses');
        }, 2000);
      } catch (error) {
        // Handle errors during database operations
        console.error('Error creating expense record:', error);
        setIsProcessing(false);
        if (error instanceof Error) {
          if (error.message.includes('Missing required attribute')) {
            setError('Missing required information. Please check your form details.');
          } else if (error.message.includes('Permission denied')) {
            setError('You do not have permission to create expenses.');
          } else {
            setError(`Database error: ${error.message}`);
          }
        } else {
          setError('Failed to submit expense. Please try again.');
        }
      }
    } catch (error) {
      // Handle errors during attachment processing
      console.error('Error processing attachments:', error);
      setIsProcessing(false);
      
      if (error instanceof Error) {
        if (error.message.includes('File size too large')) {
          setError(error.message);
        } else if (error.message.includes('Unsupported file type')) {
          setError(error.message);
        } else {
          setError(`Error uploading files: ${error.message}`);
        }
      } else {
        setError('Failed to upload attachments. Please try again.');
      }
    }
  };
  
  // Progress bar calculation
  const progressSteps = 3;
  const currentStep = 
    currentView === 'profile' ? 0 :
    currentView === 'attachments' ? 1 :
    currentView === 'details' ? 2 : 3;
  
  // Render the progress bar
  const renderProgressBar = () => {
    return (
      <XStack width="100%" gap="$2" marginVertical="$4">
        {Array.from({ length: progressSteps }).map((_, i) => (
          <ProgressIndicator
            key={i}
            flex={1}
            active={i <= currentStep}
          />
        ))}
      </XStack>
    );
  };
  
  // Render the profile/user info view
  const renderProfileView = () => {
    return (
      <YStack gap="$4" width="100%">
        <AnimatedCard active={false}>
          <YStack padding="$4" gap="$2">
            <XStack justifyContent="space-between">
              <H3>Personal Information</H3>
              <Button
                icon={<Edit size={20} />}
                size="$3"
                circular
                onPress={() => {
                  setEditingProfile(!editingProfile);
                }}
              />
            </XStack>
            
            {editingProfile ? (
              // Edit mode
              <YStack gap="$3" marginTop="$2">
                <YStack>
                  <Text color="$gray11">Full Name</Text>
                  <Input
                    ref={fullNameInputRef}
                    value={fullName}
                    onChangeText={(text) => useExpenseForm.setState({ fullName: text })}
                    placeholder="Enter your full name"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      focusInput(addressInputRef);
                    }}
                  />
                </YStack>
                
                <YStack>
                  <Text color="$gray11">Address</Text>
                  <Input
                    ref={addressInputRef}
                    value={address}
                    onChangeText={(text) => useExpenseForm.setState({ address: text })}
                    placeholder="Enter your address"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      focusInput(zipCityInputRef);
                    }}
                  />
                </YStack>
                
                <YStack>
                  <Text color="$gray11">Zip and City</Text>
                  <Input
                    ref={zipCityInputRef}
                    value={zipAndCity}
                    onChangeText={(text) => useExpenseForm.setState({ zipAndCity: text })}
                    placeholder="e.g. 0123, Oslo"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      focusInput(phoneInputRef);
                    }}
                  />
                </YStack>
                
                <YStack>
                  <Text color="$gray11">Phone Number</Text>
                  <Input
                    ref={phoneInputRef}
                    value={phoneNumber}
                    onChangeText={(text) => useExpenseForm.setState({ phoneNumber: text })}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      focusInput(bankAccountInputRef);
                    }}
                  />
                </YStack>
                
                <YStack>
                  <Text color="$gray11">Bank Account</Text>
                  <Input
                    ref={bankAccountInputRef}
                    value={bankAccount}
                    onChangeText={(text) => useExpenseForm.setState({ bankAccount: text })}
                    placeholder="Enter your bank account number"
                    keyboardType="numeric"
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </YStack>
                
                <Button
                  backgroundColor="$blue9"
                  color="white"
                  onPress={() => setEditingProfile(false)}
                  icon={<Check size={18} />}
                >
                  Save Information
                </Button>
              </YStack>
            ) : (
              // Display mode
              <YStack gap="$3" marginTop="$2">
                <YStack>
                  <Text color="$gray11">Full Name</Text>
                  <Text fontSize={18} fontWeight="500">{fullName || '–'}</Text>
                </YStack>
                
                <YStack>
                  <Text color="$gray11">Address</Text>
                  <Text fontSize={18} fontWeight="500">{address || '–'}</Text>
                </YStack>
                
                <YStack>
                  <Text color="$gray11">Zip and City</Text>
                  <Text fontSize={18} fontWeight="500">{zipAndCity || '–'}</Text>
                </YStack>
                
                <YStack>
                  <Text color="$gray11">Phone Number</Text>
                  <Text fontSize={18} fontWeight="500">{phoneNumber || '–'}</Text>
                </YStack>
                
                <YStack>
                  <Text color="$gray11">Bank Account</Text>
                  <Text fontSize={18} fontWeight="500">{bankAccount || '–'}</Text>
                </YStack>
              </YStack>
            )}
          </YStack>
        </AnimatedCard>
        
        <ActionButton
          onPress={() => {
            Keyboard.dismiss();
            setCurrentView('attachments');
          }}
          disabled={!isProfileComplete()}
          opacity={isProfileComplete() ? 1 : 0.5}
        >
          <Text color="white" fontWeight="600">
            Continue to Attachments
          </Text>
          <ChevronRight color="white" />
        </ActionButton>
      </YStack>
    );
  };
  
  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);
  
  // Fetch departments when campus changes or search query updates
  useEffect(() => {
    if (!campus) {
      setDepartments([]);
      return;
    }
    
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        setDepartmentError(null);
        
        const queries = [
          Query.equal('campus_id', campus),
          Query.select(['$id', 'Name', 'campus_id']),
          Query.orderAsc('Name'),
          Query.limit(100) // Increased limit to ensure we get all departments
        ];
        
        // Add search query if present
        if (debouncedSearchQuery.trim()) {
          queries.push(Query.search('Name', debouncedSearchQuery));
        }
        
        const response = await databases.listDocuments(
          'app',
          'departments',
          queries
        );
        
        console.log(`Fetched ${response.documents.length} departments for campus ${campus}`);
        
        // Debug: Log the first 10 departments to check their structure
        console.log('First 10 departments:', JSON.stringify(response.documents.slice(0, 10), null, 2));
        
        // Log the entire response structure
        console.log('Response structure:', Object.keys(response));
        
        // Check if departments have proper Name attribute
        const validDepts = response.documents.filter(d => d.Name);
        console.log(`Valid departments with Name: ${validDepts.length} out of ${response.documents.length}`);
        
        setDepartments(response.documents);
        
        // Check if we need pagination
        if (response.total > response.documents.length) {
          console.log(`There are more departments available: ${response.total} total`);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartmentError('Failed to load departments');
      } finally {
        setLoadingDepartments(false);
      }
    };
    
    fetchDepartments();
  }, [campus, debouncedSearchQuery]);
  
  // Find selected department
  const selectedDepartment = departments.find(d => d.$id === department);
  
  // Add a new function to handle navigation from attachments to details
  const handleNavigateToDetails = async () => {
    if (!isAttachmentsComplete()) return;
    
    if (aiEnabled) {
      setIsProcessing(true);
      const intervalId = startAiProcessing('description');
      
      try {
        // Generate description using AI
        const description = await generateExpenseDescription(attachments, eventName);
        setGeneralDescription(description);
      } catch (error) {
        console.error('Error generating description:', error);
        setError("Failed to generate description. You'll need to enter it manually.");
        clearErrorAfterDelay();
      } finally {
        stopAiProcessing(intervalId);
        setCurrentView('details');
      }
    } else {
      // If AI is not enabled, just navigate
      setCurrentView('details');
    }
  };
  
  // Render the attachments view
  const renderAttachmentsView = () => {
    return (
      <YStack gap="$4" width="100%">
        <AnimatedCard active={false}>
          <YStack padding="$4" gap="$3">
            <H3>Upload Attachments</H3>
            
            <XStack alignItems="center" gap="$2">
              <CustomSwitch 
                checked={aiEnabled}
                onCheckedChange={toggleAI}
              />
              <Text fontWeight="500">Use AI Assistant</Text>
              
              <Button 
                circular 
                icon={<Info size={18} color="$gray11" />}
                backgroundColor="transparent"
                borderWidth={0}
                padding="$0"
                chromeless
                onPress={() => setShowInfoDetails(!showInfoDetails)}
              />
            </XStack>
            
            {/* Inline expandable info panel */}
            {showInfoDetails && (
              <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 300 }}
              >
                <YStack
                  backgroundColor="$blue2"
                  padding="$3"
                  borderRadius="$2"
                  marginTop="$2"
                >
                  <Text fontSize="$2" color="$blue11">
                    AI will analyze your receipts to automatically extract date, amount, and description.
                    It can also detect foreign currencies and convert amounts to NOK.
                  </Text>
                  <Text fontSize="$2" color="$blue11" marginTop="$2">
                    When you continue to the next step, AI will also generate a general expense description
                    based on all your attachments and the optional event name you provide.
                  </Text>
                </YStack>
              </MotiView>
            )}
            
            {/* Event name input field (visible when AI is enabled) */}
            {aiEnabled && (
              <MotiView
                from={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ type: 'timing', duration: 300 }}
              >
                <YStack gap="$2" marginTop="$3">
                  <Text fontWeight="500">Event Name (Optional)</Text>
                  <Input
                    ref={eventNameInputRef}
                    placeholder="Enter event name if these expenses are for a specific event"
                    value={eventName}
                    onChangeText={setEventName}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                  <Text fontSize="$2" color="$gray11">
                    This helps AI generate a more accurate expense description.
                  </Text>
                </YStack>
              </MotiView>
            )}
            
            <Text color="$gray11" marginTop="$2">
              AI will help extract date, amount and description from your receipts.
            </Text>
            
            {/* Inline error message */}
            {error && (
              <MotiView
                from={{ opacity: 0, translateY: -5 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 300 }}
              >
                <XStack 
                  backgroundColor="$red2" 
                  padding="$3" 
                  borderRadius="$2" 
                  marginTop="$2"
                  alignItems="center"
                  gap="$2"
                >
                  <AlertCircle size={18} color="$red9" />
                  <Text color="$red9" flex={1}>{error}</Text>
                  <Button
                    size="$2"
                    circular
                    icon={<X size={14} color="$red9" />}
                    backgroundColor="transparent"
                    onPress={() => setError(null)}
                  />
                </XStack>
              </MotiView>
            )}
            
            <YStack marginTop="$4" gap="$4">
              <Button
                width="100%"
                height={64}
                onPress={captureImage}
                backgroundColor="$blue9"
                color="white"
                borderRadius={12}
                disabled={cameraLoading || uploadLoading || isProcessing}
                opacity={cameraLoading || uploadLoading || isProcessing ? 0.7 : 1}
              >
                <XStack alignItems="center" gap="$3" paddingHorizontal="$3">
                  {cameraLoading ? (
                    <Spinner color="white" size="small" />
                  ) : (
                    <Camera size={28} color="white" />
                  )}
                  <Text color="white" fontWeight="600" fontSize={18}>
                    {cameraLoading ? "Accessing Camera..." : "Take Photo"}
                  </Text>
                </XStack>
              </Button>
              
              <Button
                width="100%"
                height={64}
                onPress={pickFileOrImage}
                backgroundColor="$blue9"
                color="white"
                borderRadius={12}
                disabled={cameraLoading || uploadLoading || isProcessing}
                opacity={cameraLoading || uploadLoading || isProcessing ? 0.7 : 1}
              >
                <XStack alignItems="center" gap="$3" paddingHorizontal="$3">
                  {uploadLoading ? (
                    <Spinner color="white" size="small" />
                  ) : (
                    <Upload size={28} color="white" />
                  )}
                  <Text color="white" fontWeight="600" fontSize={18}>
                    {uploadLoading ? "Selecting File..." : "Upload File"}
                  </Text>
                </XStack>
              </Button>
            </YStack>
            
            {/* Processing indicator for AI */}
            {isProcessing && (
              <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 400 }}
              >
                <YStack
                  alignItems="center"
                  justifyContent="center"
                  padding="$4"
                  marginTop="$3"
                  backgroundColor="$blue2"
                  borderRadius={12}
                  marginBottom="$2"
                >
                  <XStack gap="$3" alignItems="center" justifyContent="center">
                    <MotiView
                      animate={{ rotate: '360deg' }}
                      transition={{
                        type: 'timing',
                        duration: 1500,
                        loop: true,
                      }}
                    >
                      <MaterialIcons name="psychology" size={28} color={theme.blue9?.get() || '#3B82F6'} />
                    </MotiView>
                    
                    <YStack>
                      <Text color="$blue9" fontWeight="600" fontSize={16}>
                        {aiProcessingType === 'receipt' ? (
                          <>
                            {aiProcessingStep === 0 && "AI is analyzing your receipt..."}
                            {aiProcessingStep === 1 && "Teaching AI to read your handwriting..."}
                            {aiProcessingStep === 2 && "Counting beans and doing math..."}
                            {aiProcessingStep === 3 && "Detecting if you bought something fun..."}
                            {aiProcessingStep === 4 && "Almost done! Just double-checking the math..."}
                          </>
                        ) : (
                          <>
                            {aiProcessingStep === 0 && "AI is summarizing your expenses..."}
                            {aiProcessingStep === 1 && "Looking for patterns in your receipts..."}
                            {aiProcessingStep === 2 && "Crafting the perfect expense description..."}
                            {aiProcessingStep === 3 && "Checking event relevance..."}
                            {aiProcessingStep === 4 && "Finalizing your expense summary..."}
                          </>
                        )}
                      </Text>
                      <Text color="$blue8" fontSize={14} marginTop="$1">
                        {aiProcessingType === 'receipt' ? (
                          <>
                            {aiProcessingStep === 0 && "This usually takes a few seconds"}
                            {aiProcessingStep === 1 && "Even AI struggles with doctor's handwriting"}
                            {aiProcessingStep === 2 && "Making sure all expenses add up"}
                            {aiProcessingStep === 3 && "Coffee counts as a business expense, right?"}
                            {aiProcessingStep === 4 && "Saving you from manual data entry..."}
                          </>
                        ) : (
                          <>
                            {aiProcessingStep === 0 && "Creating a concise summary for your expense"}
                            {aiProcessingStep === 1 && "Identifying the purpose of your expenses"}
                            {aiProcessingStep === 2 && "Incorporating event details if provided"}
                            {aiProcessingStep === 3 && "Making sure the description reflects all receipts"}
                            {aiProcessingStep === 4 && "Almost done with your perfect description..."}
                          </>
                        )}
                      </Text>
                    </YStack>
                  </XStack>
                </YStack>
              </MotiView>
            )}
            
            <Separator marginVertical="$4" />
            
            <Text fontWeight="600" fontSize={18}>
              {attachments.length} {attachments.length === 1 ? 'Attachment' : 'Attachments'}
            </Text>
            
            {attachments.length === 0 ? (
              <YStack
                padding="$4"
                alignItems="center"
                justifyContent="center"
                marginVertical="$3"
                backgroundColor="$gray2"
                borderRadius={12}
                height={120}
              >
                <Text color="$gray11">
                  No attachments added yet.
                </Text>
                <Text color="$gray11">
                  Add your first receipt or document.
                </Text>
              </YStack>
            ) : (
              <YStack gap="$3">
                {attachments.map((attachment, index) => (
                  <AttachmentCard key={index}>
                    <XStack gap="$3" alignItems="center">
                      {attachment.type === 'pdf' ? (
                        <FileIcon size={48} type="pdf" />
                      ) : (
                        <Image
                          source={{ uri: attachment.url }}
                          width={48}
                          height={48}
                          borderRadius={8}
                        />
                      )}
                      
                      <YStack flex={1} gap="$1">
                        <Text fontWeight="600" numberOfLines={1}>
                          {attachment.description}
                        </Text>
                        <XStack alignItems="center" gap="$2">
                          <Text color="$gray11" fontSize={14}>
                            {new Date(attachment.date).toLocaleDateString()}
                          </Text>
                          <Text color="$gray11" fontSize={14}>•</Text>
                          <Text 
                            color={attachment.currency && attachment.currency !== 'NOK' 
                              ? '$amber9' 
                              : '$gray11'
                            } 
                            fontSize={14}
                            fontWeight={attachment.currency && attachment.currency !== 'NOK' ? '600' : '400'}
                          >
                            {attachment.amount.toLocaleString('en-US', {
                              style: 'currency',
                              currency: attachment.currency || 'NOK'
                            })}
                          </Text>
                        </XStack>
                        
                        {attachment.currency && attachment.currency !== 'NOK' && (
                          <XStack backgroundColor="$amber2" paddingHorizontal="$2" paddingVertical="$1" borderRadius={4} marginTop="$1" alignItems="center">
                            <AlertCircle size={12} color="$amber9" />
                            <Text color="$amber9" fontSize={12} marginLeft="$1">
                              Foreign currency - NOK {attachment.nokAmount?.toFixed(2) || '?'}
                            </Text>
                          </XStack>
                        )}
                      </YStack>
                      
                      <Button
                        size="$3"
                        circular
                        onPress={() => editAttachment(index)}
                        icon={<Edit size={16} />}
                      />
                      
                      <Button
                        size="$3"
                        circular
                        onPress={() => removeAttachment(index)}
                        icon={<X size={16} />}
                      />
                    </XStack>
                  </AttachmentCard>
                ))}
                
                {/* Show foreign currency warning if any attachments have non-NOK currency */}
                {attachments.some(a => a.currency && a.currency !== 'NOK') && (
                  <YStack
                    backgroundColor="$amber2"
                    padding="$3"
                    borderRadius={12}
                    gap="$2"
                  >
                    <XStack alignItems="center" gap="$2">
                      <AlertCircle size={20} color="$amber9" />
                      <Text fontWeight="600" color="$amber9">
                        Foreign Currency Detected
                      </Text>
                    </XStack>
                    <Text color="$amber9">
                      Some receipts are in foreign currency. You may need to upload additional bank statements to verify the correct NOK value.
                    </Text>
                  </YStack>
                )}
              </YStack>
            )}
          </YStack>
        </AnimatedCard>
        
        <XStack gap="$3">
          <ActionButton
            variant="secondary"
            flex={1}
            onPress={() => {
              Keyboard.dismiss();
              setCurrentView('profile');
            }}
          >
            <ChevronLeft />
            <Text fontWeight="600">Back</Text>
          </ActionButton>
          
          <ActionButton
            flex={2}
            onPress={() => {
              Keyboard.dismiss();
              handleNavigateToDetails();
            }}
            disabled={!isAttachmentsComplete()}
            opacity={isAttachmentsComplete() ? 1 : 0.5}
          >
            <Text color="white" fontWeight="600">
              Continue to Details
            </Text>
            <ChevronRight color="white" />
          </ActionButton>
        </XStack>
      </YStack>
    );
  };
  
  // Render the details view
  const renderDetailsView = () => {
    return (
      <YStack gap="$4" width="100%">
        <AnimatedCard active={false}>
          <YStack padding="$4" gap="$3">
            <H3>Expense Details</H3>
            
            <YStack gap="$3" marginTop="$2">
              <Text fontWeight="600">Select Campus</Text>
              <CampusSelector
                campus={campus || undefined}
                onSelect={(selectedCampus: Models.Document | null) => {
                  setCampus(selectedCampus ? selectedCampus.$id : null);
                  // Reset department when campus changes
                  setDepartment(null);
                  setSearchQuery('');
                }}
              />
              
              {campus && (
                <YStack gap="$3" marginTop="$2">
                  <Text fontWeight="600">Select Department</Text>
                  
                  {/* Search input */}
                  <XStack width="100%" gap="$2" alignItems="center" marginBottom="$2">
                    <Input
                      ref={searchInputRef}
                      flex={1}
                      placeholder="Search departments..."
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCapitalize="none"
                      autoCorrect={false}
                      clearButtonMode="while-editing"
                      returnKeyType="search"
                      onSubmitEditing={() => Keyboard.dismiss()}
                    />
                    {loadingDepartments && (
                      <Spinner size="small" />
                    )}
                  </XStack>
                  
                  {/* Selected department display */}
                  {selectedDepartment && (
                    <XStack 
                      backgroundColor="$blue2" 
                      padding="$3" 
                      borderRadius={8} 
                      alignItems="center"
                      marginBottom="$2"
                    >
                      <Text flex={1} fontWeight="600" color="$blue9">
                        Selected: {selectedDepartment.Name}
                      </Text>
                      <Button
                        size="$2"
                        circular
                        icon={<X size={16} />}
                        onPress={() => setDepartment(null)}
                      />
                    </XStack>
                  )}
                  
                  {/* Department list */}
                  {departmentError ? (
                    <XStack padding="$3" backgroundColor="$red2" borderRadius={8}>
                      <Text color="$red9">{departmentError}</Text>
                    </XStack>
                  ) : departments.length === 0 && !loadingDepartments ? (
                    <XStack padding="$3" backgroundColor="$amber2" borderRadius={8}>
                      <Text color="$amber9">
                        {debouncedSearchQuery 
                          ? "No departments match your search" 
                          : "No departments found for this campus"}
                      </Text>
                    </XStack>
                  ) : (
                    <>
                      <Text fontSize={14} color="$gray11" marginBottom="$1">
                        Showing {departments.length} departments
                      </Text>
                      
                      {/* Use a flat list approach for better performance */}
                      <YStack 
                        height={240}
                        borderWidth={1} 
                        borderColor="$gray5" 
                        borderRadius={8}
                      >
                        {/* Important: Make sure this is a native ScrollView that works on mobile */}
                        <ScrollView 
                          showsVerticalScrollIndicator={true}
                          nestedScrollEnabled={true}
                          style={{ flex: 1 }}
                          contentContainerStyle={{ paddingVertical: 2 }}
                        >
                          {departments.map((item, index) => (
                            <Button
                              key={item.$id}
                              backgroundColor={department === item.$id ? '$blue9' : 'transparent'}
                              color={department === item.$id ? 'white' : '$gray12'}
                              borderRadius={0}
                              justifyContent="flex-start"
                              paddingHorizontal="$3"
                              paddingVertical="$3"
                              marginVertical="$1"
                              onPress={() => setDepartment(item.$id)}
                              borderBottomWidth={1}
                              borderBottomColor="$gray4"
                            >
                              <XStack alignItems="center" width="100%">
                                <Text 
                                  color={department === item.$id ? 'white' : '$gray12'} 
                                  numberOfLines={1}
                                >
                                  {item.Name}
                                </Text>
                              </XStack>
                            </Button>
                          ))}
                        </ScrollView>
                      </YStack>
                    </>
                  )}
                </YStack>

              )}
              
              <YStack gap="$2" marginTop="$3">
                <Text fontWeight="600">General Description</Text>
                <TextArea
                  ref={descriptionInputRef}
                  value={generalDescription}
                  onChangeText={setGeneralDescription}
                  placeholder="Please provide a general description of this expense"
                  height={120}
                  multiline={true}
                  textAlignVertical="top"
                  paddingTop="$2"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onFocus={() => {
                    // When this field is focused, make sure it's visible above the keyboard
                    // Wait for the keyboard animation to complete
                    setTimeout(() => {
                      if (scrollViewRef.current) {
                        // @ts-ignore - scrollToEnd exists on the native component
                        scrollViewRef.current.scrollToEnd({ animated: true });
                      }
                    }, 300);
                  }}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
                {aiEnabled && generalDescription && (
                  <XStack alignItems="center" gap="$2" marginTop="$1">
                    <MaterialIcons name="psychology" size={16} color={theme.blue9?.get() || '#3B82F6'} />
                    <Text fontSize="$2" color="$blue9">
                      AI-generated description. Feel free to edit if needed.
                    </Text>
                  </XStack>
                )}
              </YStack>
            </YStack>
          </YStack>
        </AnimatedCard>
        
        <XStack gap="$3">
          <ActionButton
            variant="secondary"
            flex={1}
            onPress={() => {
              Keyboard.dismiss();
              setCurrentView('attachments');
            }}
          >
            <ChevronLeft />
            <Text fontWeight="600">Back</Text>
          </ActionButton>
          
          <ActionButton
            flex={2}
            onPress={() => {
              Keyboard.dismiss();
              setCurrentView('review');
            }}
            disabled={!isDetailsComplete()}
            opacity={isDetailsComplete() ? 1 : 0.5}
          >
            <Text color="white" fontWeight="600">
              Review Submission
            </Text>
            <ChevronRight color="white" />
          </ActionButton>
        </XStack>
      </YStack>
    );
  };
  
  // Render the review view
  const renderReviewView = () => {
    // Calculate total amount
    const totalAmount = attachments.reduce((sum, item) => {
      // Use nokAmount if available, otherwise use amount
      return sum + (item.nokAmount || item.amount);
    }, 0);
    
    // Find selected department
    const selectedDepartment = departments.find(d => d.$id === department);
    
    return (
      <YStack gap="$4" width="100%">
        <AnimatedCard active={false}>
          <YStack padding="$4" gap="$3">
            <H3>Review Submission</H3>
            
            {/* Success message */}
            {successMessage && (
              <MotiView
                from={{ opacity: 0, translateY: -5 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 300 }}
              >
                <XStack 
                  backgroundColor="$green2" 
                  padding="$3" 
                  borderRadius="$2" 
                  marginTop="$2"
                  alignItems="center"
                  gap="$2"
                >
                  <Check size={18} color="$green9" />
                  <Text color="$green9" flex={1}>{successMessage}</Text>
                </XStack>
              </MotiView>
            )}
            
            <YStack gap="$4" marginTop="$2">
              <YStack>
                <Text color="$gray11">Submitted By</Text>
                <Text fontSize={18} fontWeight="500">{fullName}</Text>
              </YStack>
              
              <YStack>
                <Text color="$gray11">Total Amount</Text>
                <Text fontSize={24} fontWeight="700" color="$blue9">
                  {totalAmount.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'NOK'
                  })}
                </Text>
              </YStack>
              
              <YStack>
                <Text color="$gray11">Campus & Department</Text>
                <Text fontSize={18} fontWeight="500">
                  {CAMPUSES.find(c => c.id === campus)?.name || '–'} / {selectedDepartment?.Name || '–'}
                </Text>
              </YStack>
              
              <YStack>
                <Text color="$gray11">Description</Text>
                <Text fontSize={18}>{generalDescription}</Text>
              </YStack>
              
              <Separator />
              
              <YStack>
                <Text color="$gray11" fontWeight="500">
                  {attachments.length} {attachments.length === 1 ? 'Attachment' : 'Attachments'}
                </Text>
                
                {attachments.map((attachment, index) => (
                  <AttachmentCard key={index} marginTop="$2">
                    <XStack gap="$3" alignItems="center">
                      {attachment.type === 'pdf' ? (
                        <FileIcon size={36} type="pdf" />
                      ) : (
                        <Image
                          source={{ uri: attachment.url }}
                          width={36}
                          height={36}
                          borderRadius={8}
                        />
                      )}
                      
                      <YStack flex={1} gap="$1">
                        <Text fontWeight="600" numberOfLines={1}>
                          {attachment.description}
                        </Text>
                        <XStack alignItems="center" gap="$2">
                          <Text color="$gray11" fontSize={14}>
                            {new Date(attachment.date).toLocaleDateString()}
                          </Text>
                          <Text color="$gray11" fontSize={14}>•</Text>
                          <Text 
                            color="$gray11" 
                            fontSize={14}
                          >
                            {(attachment.nokAmount || attachment.amount).toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'NOK'
                            })}
                          </Text>
                        </XStack>
                      </YStack>
                    </XStack>
                  </AttachmentCard>
                ))}
              </YStack>
            </YStack>
          </YStack>
        </AnimatedCard>
        
        <XStack gap="$3">
          <ActionButton
            variant="secondary"
            flex={1}
            onPress={() => {
              Keyboard.dismiss();
              setCurrentView('details');
            }}
          >
            <ChevronLeft />
            <Text fontWeight="600">Back</Text>
          </ActionButton>
          
          <ActionButton
            flex={2}
            variant="success"
            onPress={handleSubmit}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <XStack>
                <Spinner color="white" />
                <Text color="white" fontWeight="600" marginLeft="$2">
                  Submitting...
                </Text>
              </XStack>
            ) : (
              <Text color="white" fontWeight="600">
                Submit Expense
              </Text>
            )}
          </ActionButton>
        </XStack>
      </YStack>
    );
  };
  
  // Function to dismiss keyboard when tapping outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Implement a function to focus inputs with proper scrolling

  // Add this helper function to handle input focus with proper scrolling
  const focusInput = (inputRef: React.RefObject<TextInput>, scrollPosition?: number) => {
    // First dismiss the keyboard to avoid jumping
    Keyboard.dismiss();
    
    // Short delay to let the UI settle
    setTimeout(() => {
      if (inputRef?.current) {
        inputRef.current.focus();
        
        // If a specific scroll position was provided, scroll to it
        if (scrollPosition !== undefined && scrollViewRef.current) {
          // @ts-ignore - scrollTo exists on the native component
          scrollViewRef.current.scrollToPosition(0, scrollPosition, true);
        }
      }
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 84 : 0}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ padding: 16 }}
          enableOnAndroid={true}
          extraScrollHeight={120}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={true}
        >
          <YStack 
            width="100%" 
            alignItems="center" 
            marginBottom={keyboardVisible ? `${keyboardHeight + 20}` : "$6"}
          >
            <XStack width="100%" justifyContent="space-between" alignItems="center" marginBottom="$4">
              <Button
                size="$3"
                circular
                icon={<ChevronLeft size={24} />}
                onPress={() => router.back()}
              />
              <H2>New Expense</H2>
              <View style={{ width: 40 }} />
            </XStack>
            
            {renderProgressBar()}
            
            <AnimatePresence>
              <MotiView
                key={currentView}
                from={{ opacity: 0, translateX: 20 }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: -20 }}
                transition={{ type: 'timing', duration: 300 }}
                style={{ width: '100%' }}
              >
                {currentView === 'profile' && renderProfileView()}
                {currentView === 'attachments' && renderAttachmentsView()}
                {currentView === 'details' && renderDetailsView()}
                {currentView === 'review' && renderReviewView()}
              </MotiView>
            </AnimatePresence>
          </YStack>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
      
      {/* Sheet for adding/editing attachments */}
      <Sheet
        modal
        open={showAttachmentSheet}
        onOpenChange={(open: boolean) => {
          if (!open) {
            Keyboard.dismiss();
          } else {
            // Wait a moment before focusing to avoid keyboard issues
            setTimeout(() => {
              // Focus but don't scroll since this is in a sheet
              if (attachmentDescriptionRef?.current) {
                attachmentDescriptionRef.current.focus();
              }
            }, 150);
          }
          setShowAttachmentSheet(open);
        }}
        snapPoints={[keyboardVisible ? 80 : 50]}
        dismissOnSnapToBottom
        position={0}
        zIndex={100000}
      >
        <Sheet.Frame padding="$4">
          <Sheet.Handle />
          
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
              <YStack gap="$4">
                <H3>{editingAttachmentIndex !== null ? 'Edit Attachment' : 'New Attachment'}</H3>
                
                <XStack gap="$3" alignItems="center">
                  {selectedFileType?.includes('pdf') ? (
                    <FileIcon size={60} type="pdf" />
                  ) : selectedFileUri ? (
                    <Image
                      source={{ uri: selectedFileUri }}
                      width={60}
                      height={60}
                      borderRadius={10}
                    />
                  ) : null}
                  
                  <YStack flex={1} gap="$2">
                    <Input
                      ref={attachmentDescriptionRef}
                      placeholder="Description"
                      value={tempAttachment?.description || ''}
                      onChangeText={(text) => setTempAttachment({ ...tempAttachment, description: text })}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        attachmentAmountRef?.current?.focus();
                      }}
                    />
                    
                    <XStack gap="$2">
                      <Input
                        ref={attachmentAmountRef}
                        flex={1}
                        placeholder="Amount"
                        value={tempAttachment?.amount?.toString() || ''}
                        onChangeText={(text) => {
                          const amount = parseFloat(text) || 0;
                          setTempAttachment({ ...tempAttachment, amount });
                        }}
                        keyboardType="numeric"
                        returnKeyType="done"
                        onSubmitEditing={() => Keyboard.dismiss()}
                      />
                      
                      <Button
                        flex={1}
                        onPress={() => {
                          Keyboard.dismiss(); // Dismiss keyboard before showing date picker
                          // Open date picker
                          const date = tempAttachment?.date || new Date();
                          // In a real implementation, you'd show a date picker here
                          setTempAttachment({ ...tempAttachment, date });
                        }}
                      >
                        {tempAttachment?.date
                          ? new Date(tempAttachment.date).toLocaleDateString()
                          : 'Select Date'}
                      </Button>
                    </XStack>
                  </YStack>
                </XStack>
                
                {tempAttachment?.currency && tempAttachment.currency !== 'NOK' && (
                  <YStack
                    backgroundColor="$amber2"
                    padding="$3"
                    borderRadius={12}
                    gap="$2"
                  >
                    <XStack alignItems="center" gap="$2">
                      <AlertCircle size={16} color="$amber9" />
                      <Text fontWeight="600" color="$amber9">
                        Foreign Currency: {tempAttachment.currency}
                      </Text>
                    </XStack>
                    <Text color="$amber9">
                      Exchange rate: {tempAttachment.exchangeRate?.toFixed(2) || '?'}
                    </Text>
                    <Text color="$amber9">
                      NOK amount: {tempAttachment.nokAmount?.toFixed(2) || '?'}
                    </Text>
                  </YStack>
                )}
                
                <Button
                  backgroundColor="$blue9"
                  color="white"
                  size="$4"
                  onPress={saveAttachment}
                  disabled={!tempAttachment?.description || (tempAttachment?.amount || 0) <= 0}
                >
                  Save Attachment
                </Button>
              </YStack>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Sheet.Frame>
      </Sheet>
    </KeyboardAvoidingView>
  );
} 