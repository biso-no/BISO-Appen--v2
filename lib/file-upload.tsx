import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  YStack, Text, XStack, Image, ScrollView,
  Stack, Button, Sheet, styled,
  Label,
  Input,
  AnimatePresence
} from "tamagui";
import { launchCameraAsync } from 'expo-image-picker';
import { uriToBlob } from "./utils/uriToBlob";
import { File } from "./file-utils";
import { triggerFunction } from "./appwrite";
import { pickFiles } from "./file-utils";
import MlkitOcr from 'react-native-mlkit-ocr';
import { formatDate } from "./format-time";
import {
  Plus, Camera, Upload, ChevronRight,
  Receipt,
  Calendar,
  FileText
} from "@tamagui/lucide-icons";
import { DateTimePicker } from "@/components/ui/date-picker";
import { MotiView } from "moti";

interface Attachment {
  url: string;
  description: string;
  date: Date;
  amount: number;
  type: 'pdf' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'heic';
  status?: 'processing' | 'success' | 'error';
}

interface FileUploadProps {
  ocrResults: Attachment[];
  setOcrResults: React.Dispatch<React.SetStateAction<Attachment[]>>;
}

const DocumentCard = styled(Stack, {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '$gray4',
    animation: 'bouncy',
    pressStyle: {
      scale: 0.97
    }
  });
  
  const AddDocumentCard = styled(Stack, {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '$gray4',
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    animation: 'bouncy',
    enterStyle: {
      scale: 0.95,
      opacity: 0,
    },
    exitStyle: {
      scale: 0.95,
      opacity: 0,
    }
  });
  
  const IconButton = styled(Button, {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'bouncy',
    pressStyle: {
      scale: 0.9
    }
  });
  
  const EditField = styled(YStack, {
    backgroundColor: '$gray2',
    borderRadius: 12,
    marginBottom: 12,
  });

export function FileUpload({ ocrResults, setOcrResults }: FileUploadProps) {
    const [showUploadOptions, setShowUploadOptions] = useState(false);
    const [processingQueue, setProcessingQueue] = useState<File[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<Attachment | null>(null);
    const [showEditSheet, setShowEditSheet] = useState(false);



  const processFile = useCallback(async (file: File) => {
    const newAttachment: Attachment = {
      url: file.uri,
      description: '',
      date: new Date(),
      amount: 0,
      type: (file.type.split('/')[1] || 'pdf') as Attachment['type'],
      status: 'processing'
    };

    setOcrResults(prev => [...prev, newAttachment]);

    try {
      if (file.type === 'application/pdf') {
        setOcrResults(prev => prev.map(item => 
          item.url === file.uri 
            ? { ...item, status: 'success' } 
            : item
        ));
        return;
      }

      const ocrResult = await MlkitOcr.detectFromUri(file.uri);
      const extractedText = ocrResult.map(block => block.text).join(' ');
      const functionResults = await triggerFunction({
        functionId: 'process_receipts',
        data: extractedText,
        async: false,
      });

      if (functionResults.responseBody) {
        const responseBody = JSON.parse(functionResults.responseBody);
        setOcrResults(prev => prev.map(item =>
          item.url === file.uri
            ? {
                ...item,
                description: responseBody.description,
                date: new Date(responseBody.date),
                amount: responseBody.amount,
                status: 'success'
              }
            : item
        ));
      }
    } catch (error) {
      console.error(`Error processing file: `, error);
      setOcrResults(prev => prev.map(item =>
        item.url === file.uri
          ? { ...item, status: 'error' }
          : item
      ));
    }
  }, [setOcrResults]);

  const handleDocumentPress = (document: Attachment) => {
    setSelectedDocument(document);
    setShowEditSheet(true);
  };


  const handleSaveEdit = () => {
    if (selectedDocument) {
      setOcrResults(prev => prev.map(doc => 
        doc.url === selectedDocument.url ? selectedDocument : doc
      ));
      setShowEditSheet(false);
      setSelectedDocument(null);
    }
  };

  const handleCamera = async () => {
    setShowUploadOptions(false);
    const result = await launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      const newUrl = result.assets[0].uri;
      const blob = await uriToBlob(newUrl);
      const file: File = {
        name: newUrl.split('/').pop() || 'captured_image',
        type: 'image/jpeg',
        size: blob.size,
        uri: newUrl,
      };
      setProcessingQueue(prev => [...prev, file]);
    }
  };

  const handleFileSelection = async () => {
    setShowUploadOptions(false);
    const result = await pickFiles();
    if (result) {
      const newFiles = result.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        uri: file.uri,
      }));
      setProcessingQueue(prev => [...prev, ...newFiles]);
    }
  };

  useEffect(() => {
    const processQueue = async () => {
      if (processingQueue.length > 0) {
        const [nextFile, ...remaining] = processingQueue;
        setProcessingQueue(remaining);
        await processFile(nextFile);
      }
    };
    processQueue();
  }, [processingQueue, processFile]);

  const memoizedTotal = useMemo(() => {
    return ocrResults
      .filter(result => result.status === 'success')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [ocrResults]);

  const handleEditDocument = useCallback((field: keyof Attachment, value: any) => {
    if (selectedDocument) {
      setSelectedDocument(prev => prev ? {
        ...prev,
        [field]: value
      } : null);
    }
  }, [selectedDocument]);

  return (
    <YStack>
      <ScrollView 
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <AddDocumentCard>
          <MotiView
            from={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'timing', duration: 500 }}
          >
            <YStack gap="$4" alignItems="center">
              {ocrResults.length > 0 ? (
                <>
                  <Text 
                    fontSize={28} 
                    fontWeight="600" 
                    color="$gray12"
                    textAlign="center"
                  >
                    {memoizedTotal.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'NOK'
                    })}
                  </Text>
                  <XStack gap="$2" alignItems="center">
                    <Receipt size={16} color="$gray11" />
                    <Text fontSize={16} color="$gray11">
                      {ocrResults.length} {ocrResults.length === 1 ? 'Document' : 'Documents'}
                    </Text>
                  </XStack>
                </>
              ) : (
                <YStack gap="$4" alignItems="center">
                  <Receipt size={32} color="$gray11" />
                  <Text fontSize={16} color="$gray11" textAlign="center">
                    Add your first document
                  </Text>
                </YStack>
              )}
              <Button
                size="$5"
                theme="blue"
                borderRadius={12}
                paddingHorizontal={32}
                paddingVertical={12}
                onPress={() => setShowUploadOptions(true)}
                pressStyle={{ scale: 0.97 }}
                animation="bouncy"
              >
                <XStack gap="$2" alignItems="center">
                  <Plus size={20} />
                  <Text fontWeight="500">
                    Add Document
                  </Text>
                </XStack>
              </Button>
            </YStack>
          </MotiView>
        </AddDocumentCard>

        <AnimatePresence>
          {ocrResults.length > 0 && (
            <YStack gap="$3">
              <Text fontSize={18} fontWeight="600" color="$gray12" marginBottom={8}>
                Documents
              </Text>
              {ocrResults.map((document, index) => (
                <DocumentCard
                  key={document.url + index}
                  onPress={() => handleDocumentPress(document)}
                  animation="bouncy"
                  enterStyle={{
                    opacity: 0,
                    y: 10,
                  }}
                  exitStyle={{
                    opacity: 0,
                    y: -10,
                  }}
                >
                  <XStack gap="$4" alignItems="center">
                    <Image
                      source={{ uri: document.url }}
                      width={56}
                      height={56}
                      borderRadius={12}
                    />
                    <YStack flex={1} gap="$1">
                      <Text 
                        fontSize={18}
                        fontWeight="600"
                        color={document.status === 'error' ? '$red10' : '$gray12'}
                      >
                        {document.amount.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'NOK'
                        })}
                      </Text>
                      <XStack gap="$2" alignItems="center">
                        <Calendar size={14} color="$gray11" />
                        <Text fontSize={14} color="$gray11">
                          {formatDate(document.date)}
                        </Text>
                      </XStack>
                      {document.description && (
                        <XStack gap="$2" alignItems="center">
                          <FileText size={14} color="$gray10" />
                          <Text 
                            fontSize={14}
                            color="$gray10"
                            numberOfLines={1}
                          >
                            {document.description}
                          </Text>
                        </XStack>
                      )}
                    </YStack>
                    {document.status === 'processing' ? (
                      <IconButton theme="yellow">
                        <Text fontSize={12}>⏳</Text>
                      </IconButton>
                    ) : document.status === 'error' ? (
                      <IconButton theme="red">
                        <Text fontSize={12}>❌</Text>
                      </IconButton>
                    ) : (
                      <IconButton theme="gray">
                        <ChevronRight size={20} color="$gray9" />
                      </IconButton>
                    )}
                  </XStack>
                </DocumentCard>
              ))}
            </YStack>
          )}
        </AnimatePresence>
      </ScrollView>

      {/* Upload Options Sheet */}
      <Sheet
        modal
        open={showUploadOptions}
        onOpenChange={setShowUploadOptions}
        snapPoints={[30]}
        dismissOnSnapToBottom
        animation="medium"
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4">
          <Sheet.Handle />
          <YStack gap="$4" marginTop="$4">
            <Button
              size="$5"
              theme="blue"
              icon={Camera}
              onPress={handleCamera}
              pressStyle={{ scale: 0.97 }}
              animation="bouncy"
            >
              Take Photo
            </Button>
            <Button
              size="$5"
              theme="blue"
              icon={Upload}
              onPress={handleFileSelection}
              pressStyle={{ scale: 0.97 }}
              animation="bouncy"
            >
              Upload Document
            </Button>
          </YStack>
        </Sheet.Frame>
      </Sheet>

      {/* Edit Document Sheet - Optimized */}
      <Sheet
        modal
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        snapPoints={[65]}
        dismissOnSnapToBottom
        animation="medium"
      >
        <Sheet.Overlay />
        <Sheet.Frame padding="$4">
          <Sheet.Handle />
          {selectedDocument && (
            <YStack gap="$2">
              <Text fontSize={20} fontWeight="600">Edit Document</Text>
              
              <EditField>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  value={selectedDocument.amount.toString()}
                  onChangeText={(text) => handleEditDocument('amount', parseFloat(text) || 0)}
                  keyboardType="numeric"
                  size="$4"
                  borderWidth={0}
                  backgroundColor="transparent"
                />
              </EditField>

              <EditField>
                <Label htmlFor="date">Date</Label>
                <DateTimePicker
                  date={new Date(selectedDocument.date)}
                  onChange={(date) => handleEditDocument('date', date)}
                  type="date"
                />
              </EditField>

              <EditField>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={selectedDocument.description}
                  onChangeText={(text) => handleEditDocument('description', text)}
                  multiline
                  numberOfLines={3}
                  size="$4"
                  borderWidth={0}
                  backgroundColor="transparent"
                />
              </EditField>

              <XStack gap="$3" marginTop="$4">
                <Button
                  flex={1}
                  theme="gray"
                  onPress={() => setShowEditSheet(false)}
                  pressStyle={{ scale: 0.97 }}
                  animation="bouncy"
                >
                  Cancel
                </Button>
                <Button
                  flex={1}
                  theme="blue"
                  onPress={handleSaveEdit}
                  pressStyle={{ scale: 0.97 }}
                  animation="bouncy"
                >
                  Save Changes
                </Button>
              </XStack>
            </YStack>
          )}
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
}