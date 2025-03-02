import React, { useState } from 'react';
import { 
  Button, Text, YStack, Input, Label, 
  XStack, ScrollView, Card, Image,  
  H6, Spinner, View, Sheet, useTheme 
} from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useExpenseStore, Attachment } from '@/lib/stores/expenseStore';
import { StyleSheet, Platform, useColorScheme } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useFormContext, Controller } from 'react-hook-form';
import { ChevronDown, ChevronUp, Plus, X } from '@tamagui/lucide-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { MotiView } from 'moti';
import { FileIcon } from '@/components/ui/file-icon';

// Define supported file types
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];

export function FileUpload() {
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  const { control, formState: { errors }, watch, setValue } = useFormContext();
  const attachments = watch('expenseAttachments') || [];
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Function to reset the form
  const resetFormFields = () => {
    setDate(new Date());
    setAmount('');
    setDescription('');
    setSelectedFile(null);
    setFileType(null);
    setEditingIndex(null);
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
      }
    } catch (error) {
      console.error('Error picking image:', error);
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
      >
        <Swipeable renderRightActions={renderRightActions}>
          <Card marginVertical="$2" bordered>
            <Card.Header padding="$3">
              <XStack justifyContent="space-between" alignItems="center" flex={1}>
                <XStack space="$2" alignItems="center" flex={1}>
                  {isImage ? (
                    <ExpoImage
                      source={{ uri: attachment.url }}
                      style={{ width: 40, height: 40, borderRadius: 4 }}
                      contentFit="cover"
                    />
                  ) : (
                    <FileIcon type={attachment.type} size={40} />
                  )}
                  <YStack flex={1} space="$1">
                    <Text numberOfLines={1} ellipsizeMode="tail" fontWeight="bold">
                      {attachment.description}
                    </Text>
                    <Text fontSize="$2" color="$gray11">
                      {new Date(attachment.date).toLocaleDateString()}
                    </Text>
                  </YStack>
                </XStack>
                <Text fontWeight="bold" color="$green9">
                  {attachment.amount.toFixed(2)} kr
                </Text>
              </XStack>
            </Card.Header>
          </Card>
        </Swipeable>
      </MotiView>
    );
  };

  return (
    <YStack space="$4">
      <H6 fontWeight="bold">Expense Attachments</H6>
      <Text>Upload receipts, invoices, or other documentation</Text>
      
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
              <YStack space="$2" marginVertical="$2">
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
              >
                <Text color="$gray11">No attachments added yet</Text>
              </YStack>
            )}
          </>
        )}
      />
      
      <Button
        onPress={() => setShowAddSheet(true)}
        icon={<Plus size={18} color={isDark ? 'white' : 'black'} />}
        marginTop="$2"
      >
        Add Attachment
      </Button>
      
      {/* Add/Edit Attachment Sheet */}
      <Sheet
        open={showAddSheet}
        snapPoints={[70]}
        position={0}
        onOpenChange={setShowAddSheet}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4">
          <Sheet.Handle marginBottom="$4" />
          
          <ScrollView>
            <YStack space="$4">
              <XStack justifyContent="space-between" alignItems="center">
                <H6>{editingIndex !== null ? 'Edit Attachment' : 'Add Attachment'}</H6>
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
              
              <YStack space="$2">
                <Label>Description</Label>
                <Input
                  placeholder="e.g., Dinner receipt, Train ticket"
                  value={description}
                  onChangeText={setDescription}
                />
              </YStack>
              
              <YStack space="$2">
                <Label>Amount (kr)</Label>
                <Input
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </YStack>
              
              <YStack space="$2">
                <Label>Date</Label>
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
              
              <YStack space="$2">
                <Label>Upload File</Label>
                <XStack space="$2">
                  <Button
                    flex={1}
                    onPress={pickDocument}
                    icon={<MaterialIcons name="description" size={18} color={isDark ? 'white' : 'black'} />}
                  >
                    Document
                  </Button>
                  <Button
                    flex={1}
                    onPress={pickImage}
                    icon={<MaterialIcons name="photo" size={18} color={isDark ? 'white' : 'black'} />}
                  >
                    Photo
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
                      space="$2"
                      backgroundColor="$gray3"
                      borderRadius="$2"
                    >
                      <MaterialIcons name="insert-drive-file" size={24} color={isDark ? 'white' : 'black'} />
                      <Text numberOfLines={1} ellipsizeMode="middle" flex={1}>
                        Selected document
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
                {editingIndex !== null ? 'Update Attachment' : 'Add Attachment'}
              </Button>
            </YStack>
          </ScrollView>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
} 