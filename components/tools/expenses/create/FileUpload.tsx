import React, { useState, useCallback, useEffect } from 'react';
import { 
  Button, Text, YStack, Input, Label, 
  XStack, ScrollView, Card,  
  H6, Sheet, Spinner, AlertDialog
} from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Attachment } from '@/lib/stores/expenseStore';
import { Platform, useColorScheme, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useFormContext, Controller } from 'react-hook-form';
import { Plus, X, Camera as CameraIcon, Upload } from '@tamagui/lucide-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { MotiView } from 'moti';
import { FileIcon } from '@/components/ui/file-icon';
import { CustomSwitch } from '@/components/custom-switch';
import { create } from 'zustand';
import * as FileSystem from 'expo-file-system';
import MlkitOcr from 'react-native-mlkit-ocr';
import { functions } from '@/lib/appwrite';
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';

// Extend the Attachment type to include our new fields
declare module '@/lib/stores/expenseStore' {
  interface Attachment {
    currency?: string;
    exchangeRate?: number;
    nokAmount?: number;
  }
}

// Define supported file types
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];

// Create a store for AI assistance state
interface AIAssistanceState {
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const useAIAssistanceStore = create<AIAssistanceState>((set) => ({
  isEnabled: true, // Default to on
  setEnabled: (enabled) => set({ isEnabled: enabled }),
}));

// Mock Appwrite function for demo purposes
const mockProcessReceipt = async (base64Image: string) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock data
  return {
    date: new Date().toISOString(),
    amount: Math.floor(Math.random() * 1000) + 100,
    description: i18next.t('restaurant-receipt'),
    currency: Math.random() > 0.5 ? 'EUR' : 'NOK',
    confidence: Math.random(),
    exchangeRate: 10.5,
    nokAmount: Math.floor(Math.random() * 1000) + 1000
  };
};

export function FileUpload() {
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currency, setCurrency] = useState('NOK');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [nokAmount, setNokAmount] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const { t } = useTranslation();
  const { control, formState: { errors }, watch, setValue } = useFormContext();
  const attachments = watch('expenseAttachments') || [];
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Get AI assistance state from store
  const { isEnabled: isAIAssistanceEnabled, setEnabled: setAIAssistanceEnabled } = useAIAssistanceStore();

  // Function to reset the form
  const resetFormFields = () => {
    setDate(new Date());
    setAmount('');
    setDescription('');
    setSelectedFile(null);
    setFileType(null);
    setEditingIndex(null);
    setCurrency('NOK');
    setExchangeRate(null);
    setNokAmount(null);
    setConfidence(null);
  };

  // Function to pick document
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: SUPPORTED_TYPES,
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile(asset.uri);
        setFileType(asset.mimeType || 'application/pdf');
        
        // If AI assistance is enabled and it's an image, process it
        if (isAIAssistanceEnabled && asset.mimeType?.startsWith('image/')) {
          processImageWithAI(asset.uri);
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  // Function to pick image
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedFile(result.assets[0].uri);
        setFileType(result.assets[0].type || 'image/jpeg');
        
        // If AI assistance is enabled, process the image
        if (isAIAssistanceEnabled) {
          processImageWithAI(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  // Launch camera with ImagePicker instead of using Camera directly
  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedFile(result.assets[0].uri);
        setFileType('image/jpeg');
        
        // If AI assistance is enabled, process the image
        if (isAIAssistanceEnabled) {
          processImageWithAI(result.assets[0].uri);
        } else {
          setShowAddSheet(true);
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  };

  // Process image with OCR and AI
  const processImageWithAI = async (imageUri: string) => {
    try {
      setIsLoading(true);
      
      const ocrResult = await MlkitOcr.detectFromUri(imageUri)
      const extractedText = ocrResult.map(block => block.text).join(' ');
      console.log("Extracted text: ", extractedText)
      const functionResults = await functions.createExecution('process_receipts', extractedText, false)
      
     if (functionResults.status === 'completed') {
      const data = JSON.parse(functionResults.responseBody)
      console.log("Data: ", data)
      if (data.date) setDate(new Date(data.date));
      if (data.amount) setAmount(data.amount.toString());
      if (data.description) setDescription(data.description);
      if (data.currency) setCurrency(data.currency);
      if (data.exchangeRate) setExchangeRate(data.exchangeRate);
      if (data.nokAmount) setNokAmount(data.nokAmount);
      if (data.confidence) setConfidence(data.confidence);
      
      // Automatically open the sheet to show the extracted data to the user
      setShowAddSheet(true);
      
      // Show toast notification

     }
      
    } catch (error) {
      console.error('Error processing image with AI:', error);

    } finally {
      setIsLoading(false);
    }
  };

  // Function to add an attachment
  const addAttachment = () => {
    if (!selectedFile || !description || !amount) return;

    const fileExt = fileType?.split('/')[1] || 'jpeg';
    
    const newAttachment: Attachment = {
      url: selectedFile,
      description,
      date,
      amount: parseFloat(amount),
      type: fileExt as any,
      currency: currency,
      ...(exchangeRate && { exchangeRate }),
      ...(nokAmount && { nokAmount }),
    };

    if (editingIndex !== null && editingIndex >= 0) {
      // Update existing attachment
      const updatedAttachments = [...attachments];
      updatedAttachments[editingIndex] = newAttachment;
      setValue('expenseAttachments', updatedAttachments);
    } else {
      // Add new attachment
      setValue('expenseAttachments', [...attachments, newAttachment]);
    }

    resetFormFields();
    setShowAddSheet(false);
  };

  // Function to remove an attachment
  const removeAttachment = (index: number) => {
    const updatedAttachments = attachments.filter((_: any, i: number) => i !== index);
    setValue('expenseAttachments', updatedAttachments);
  };

  // Function to edit an attachment
  const editAttachment = (index: number) => {
    const attachment = attachments[index];
    setDescription(attachment.description);
    setAmount(attachment.amount.toString());
    setDate(new Date(attachment.date));
    setSelectedFile(attachment.url);
    setFileType(`image/${attachment.type}`);
    setCurrency(attachment.currency || 'NOK');
    setExchangeRate(attachment.exchangeRate || null);
    setNokAmount(attachment.nokAmount || null);
    setEditingIndex(index);
    setShowAddSheet(true);
  };

  // Render attachment item with swipe to delete
  const renderAttachmentItem = (attachment: Attachment, index: number) => {
    const isImage = ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(attachment.type);
    
    const renderRightActions = () => (
      <XStack>
        <Button
          backgroundColor="$red10"
          color="white"
          onPress={() => editAttachment(index)}
          width={70}
          height="100%"
          justifyContent="center"
          alignItems="center"
          borderRadius={0}
        >
          <MaterialIcons name="edit" size={24} color="white" />
        </Button>
        <Button
          backgroundColor="$red11"
          color="white"
          onPress={() => removeAttachment(index)}
          width={70}
          height="100%"
          justifyContent="center"
          alignItems="center"
          borderRadius={0}
        >
          <MaterialIcons name="delete" size={24} color="white" />
        </Button>
      </XStack>
    );

    return (
      <MotiView
        key={index}
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: index * 50 }}
        style={{ width: '100%' }}
      >
        <Swipeable renderRightActions={renderRightActions}>
          <Card marginVertical="$2" bordered width="100%">
            <Card.Header padding="$3">
              <XStack justifyContent="space-between" alignItems="center" flex={1} flexWrap="nowrap">
                <XStack gap="$2" alignItems="center" flex={1} maxWidth="65%">
                  {isImage ? (
                    <ExpoImage
                      source={{ uri: attachment.url }}
                      style={{ width: 40, height: 40, borderRadius: 4, flexShrink: 0 }}
                      contentFit="cover"
                    />
                  ) : (
                    <FileIcon type={attachment.type} size={40} />
                  )}
                  <YStack flex={1} gap="$1">
                    <Text numberOfLines={1} ellipsizeMode="tail" fontWeight="bold">
                      {attachment.description}
                    </Text>
                    <Text fontSize="$2" color="$gray11">
                      {new Date(attachment.date).toLocaleDateString()}
                    </Text>
                  </YStack>
                </XStack>
                <YStack alignItems="flex-end" flexShrink={0}>
                  <Text fontWeight="bold" color="$green9" numberOfLines={1}>
                    {attachment.amount.toFixed(2)} {attachment.currency || 'NOK'}
                  </Text>
                  {attachment.nokAmount && attachment.currency !== 'NOK' && (
                    <Text fontSize="$1" color="$gray11" numberOfLines={1}>
                      {attachment.nokAmount.toFixed(2)} NOK
                    </Text>
                  )}
                </YStack>
              </XStack>
            </Card.Header>
          </Card>
        </Swipeable>
      </MotiView>
    );
  };

  return (
    <YStack gap="$4" width="100%">
      <XStack justifyContent="space-between" alignItems="center">
        <H6 fontWeight="bold">{t('expense-attachments')}</H6>

      </XStack>
      
      <Text>{t('upload-receipts-invoices-or-other-documentation')}</Text>
      <XStack alignItems="center" gap="$2">
          <Text fontSize="$2" color={isAIAssistanceEnabled ? "$blue10" : "$gray10"}>
            {t('ai-assistance')}
          </Text>
          <CustomSwitch
            checked={isAIAssistanceEnabled}
            onCheckedChange={setAIAssistanceEnabled}
          />
        </XStack>
      <Controller
        control={control}
        name="expenseAttachments"
        render={({ field }) => (
          <>
            {errors.expenseAttachments && (
              <Text color="$red10">
                {errors.expenseAttachments.message as string}
              </Text>
            )}
            
            {attachments.length > 0 ? (
              <YStack gap="$2" marginVertical="$2" width="100%">
                {attachments.map(renderAttachmentItem)}
              </YStack>
            ) : (
              <YStack 
                height={120} 
                justifyContent="center" 
                alignItems="center" 
                borderRadius="$4"
                borderWidth={1}
                borderColor="$gray7"
                borderStyle="dashed"
                marginVertical="$4"
                width="100%"
              >
                <Text color="$gray11">{t('no-attachments-added-yet')}</Text>
              </YStack>
            )}
          </>
        )}
      />
      
      <XStack gap="$2" width="100%" alignItems="center">
        <Button
          onPress={() => setShowAddSheet(true)}
          icon={<Upload size={18} color={isDark ? 'white' : 'black'} />}
        >
          {t('upload')}
        </Button>
        <Button
          onPress={openCamera}
          icon={<CameraIcon size={18} color={isDark ? 'white' : 'black'} />}
        >
          {t('capture')}
        </Button>
      </XStack>
      
      {/* Add/Edit Attachment Sheet */}
      <Sheet
        open={showAddSheet}
        snapPoints={[100]}
        position={0}
        onOpenChange={setShowAddSheet}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4">
          <Sheet.Handle marginBottom="$4" />
          
          <Sheet.ScrollView showsVerticalScrollIndicator={true}>
            <YStack gap="$4" width="100%">
              <XStack justifyContent="space-between" alignItems="center">
                <H6>{editingIndex !== null ? t('edit-attachment') : t('add-attachment')}</H6>
                <Button
                  size="$2"
                  circular
                  onPress={() => {
                    resetFormFields();
                    setShowAddSheet(false);
                  }}
                  icon={<X size={16} />}
                />
              </XStack>
              
              {isLoading && (
                <XStack padding="$4" justifyContent="center" alignItems="center">
                  <Spinner size="large" color="$blue9" />
                  <Text marginLeft="$2">{t('processing-with-ai')}</Text>
                </XStack>
              )}
              
              {confidence !== null && (
                <XStack backgroundColor="$blue2" padding="$2" borderRadius="$2" justifyContent="space-between">
                  <Text fontSize="$2" color="$blue10">{t('ai-confidence-level')}</Text>
                  <Text fontSize="$2" fontWeight="bold" color="$blue10">
                    {(confidence * 100).toFixed(0)}{t('key-3')}
                  </Text>
                </XStack>
              )}
              
              <YStack gap="$2">
                <Label>{t('description')}</Label>
                <Input
                  placeholder={t('e-g-dinner-receipt-train-ticket')}
                  value={description}
                  onChangeText={setDescription}
                />
              </YStack>
              
              <XStack gap="$2">
                <YStack gap="$2" flex={1}>
                  <Label>{t('amount')}</Label>
                  <Input
                    placeholder="0.00"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                  />
                </YStack>
              
              </XStack>
              
              {currency !== 'NOK' && exchangeRate !== null && (
                <YStack gap="$2">
                  <XStack justifyContent="space-between">
                    <Label>{t('exchange-rate')}</Label>
                    <Text fontSize="$2" color="$gray11">
                      {exchangeRate.toFixed(4)}
                    </Text>
                  </XStack>
                  <XStack justifyContent="space-between">
                    <Label>{t('amount-in-nok')}</Label>
                    <Text fontWeight="bold">
                      {nokAmount !== null ? nokAmount.toFixed(2) : '0.00'} NOK
                    </Text>
                  </XStack>
                </YStack>
              )}
              
              <YStack gap="$2">
                <Label>{t('date')}</Label>
                <Button
                  onPress={() => setShowDatePicker(true)}
                  variant="outlined"
                  justifyContent="flex-start"
                >
                  {date.toLocaleDateString()}
                </Button>
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setDate(selectedDate);
                      }
                    }}
                  />
                )}
              </YStack>

              <YStack gap="$2">
                <Label>{t('upload-file')}</Label>
                <XStack gap="$2">
                  <Button
                    onPress={pickDocument}
                    icon={<MaterialIcons name="description" size={18} color={isDark ? 'white' : 'black'} />}
                  >
                    {t('document')}
                  </Button>
                  
                </XStack>
              </YStack>
              {selectedFile && (
                <YStack
                  marginVertical="$2"
                  padding="$2"
                  borderWidth={1}
                  borderColor="$gray7"
                  borderRadius="$2"
                  width="100%"
                >
                  {fileType?.startsWith('image/') ? (
                    <ExpoImage
                      source={{ uri: selectedFile }}
                      style={{ width: '100%', height: 150, borderRadius: 4 }}
                      contentFit="contain"
                    />
                  ) : (
                    <XStack
                      padding="$2"
                      alignItems="center"
                      gap="$2"
                      backgroundColor="$gray3"
                      borderRadius="$2"
                    >
                      <MaterialIcons name="insert-drive-file" size={24} color={isDark ? 'white' : 'black'} />
                      <Text numberOfLines={1} ellipsizeMode="middle" flex={1}>
                        {t('selected-document')}
                      </Text>
                      <Button
                        size="$2"
                        circular
                        onPress={() => setSelectedFile(null)}
                        icon={<X size={14} />}
                      />
                    </XStack>
                  )}
                </YStack>
              )}
              
              <Button
                onPress={addAttachment}
                disabled={!selectedFile || !description || !amount}
                opacity={!selectedFile || !description || !amount ? 0.5 : 1}
                backgroundColor="$green9"
                marginTop="$2"
                color="white"
              >
                {editingIndex !== null ? t('update-attachment') : t('add-attachment-0')}
              </Button>
            </YStack>
          </Sheet.ScrollView>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
} 