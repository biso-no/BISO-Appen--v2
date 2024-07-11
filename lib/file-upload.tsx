import React, { useState } from "react";
import { Button, YStack, Text, XStack, Image, ScrollView, Card, Spinner, Input, Sheet, YGroup, Label } from "tamagui";
import { useFileHandler } from "./useFileHandler";
import { launchCameraAsync } from 'expo-image-picker';
import { uriToBlob } from "./utils/uriToBlob";
import { File } from "./file-utils";
import { triggerFunction } from "./appwrite";
import { pickFiles } from "./file-utils";
import MlkitOcr from 'react-native-mlkit-ocr';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome for icons
import { formatDate } from "./format-time";

interface Attachment {
    url: string;
    description: string;
    date: string;
    amount: string;
}

interface FileUploadProps {
    ocrResults: Attachment[];
    setOcrResults: React.Dispatch<React.SetStateAction<Attachment[]>>;
}

export function FileUpload({ ocrResults, setOcrResults }: FileUploadProps) {
    const { files, uploading, error, success } = useFileHandler('expense_attachments');
    const [capturing, setCapturing] = useState(false);
    const [picking, setPicking] = useState(false);
    const [filesToProcess, setFilesToProcess] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
    const [selectedOcrResult, setSelectedOcrResult] = useState<Attachment | null>(null);

    const handleCaptureImage = async () => {
        setCapturing(true);
        try {
            const result = await launchCameraAsync({
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled && result.assets[0].uri) {
                const newUrl = result.assets[0].uri;
                setPreviewUrls(prev => [...prev, newUrl]);
                const blob = await uriToBlob(newUrl);
                const file: File = {
                    name: newUrl.split('/').pop() || 'captured_image',
                    type: 'image/jpeg',
                    size: blob.size,
                    uri: newUrl,
                };
                setFilesToProcess(prev => [...prev, file]);
            }
        } finally {
            setCapturing(false);
        }
    };

    const handlePickFiles = async () => {
        setPicking(true);
        try {
            const result = await pickFiles();
            if (result) {
                const newFiles = result.map(file => ({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    uri: file.uri,
                }));

                setFilesToProcess(prev => [...prev, ...newFiles]);
                setPreviewUrls(prev => [...prev, ...newFiles.map(file => file.uri)]);
            }
        } finally {
            setPicking(false);
        }
    };

    const handleProcessWithGPT = async () => {
        setIsProcessing(true);
        const newOcrResults: Attachment[] = [];
        const ocrResultsCopy = [...ocrResults];

        for (const file of filesToProcess) {
            if (ocrResults.some(result => result.url === file.uri)) {
                // Skip already processed files
                continue;
            }

            try {
                const ocrResult = await MlkitOcr.detectFromUri(file.uri);
                const extractedText = ocrResult.map(block => block.text).join(' ');
                console.log('Extracted text:', extractedText);

                const functionResults = await triggerFunction({
                    functionId: 'process_receipts',
                    data: extractedText,
                    async: false,
                });

                if (functionResults.responseBody) {
                    const responseBody = JSON.parse(functionResults.responseBody);
                    const result = {
                        url: file.uri,
                        description: responseBody.description,
                        date: responseBody.date,
                        amount: responseBody.amount
                    };
                    newOcrResults.push(result);
                    ocrResultsCopy.push(result);
                }
            } catch (error) {
                console.error(`Error processing file ${file.name}: `, error);
            }
        }

        setOcrResults(ocrResultsCopy);
        setIsProcessing(false);
    };

    const handleOpenBottomSheet = (result: Attachment) => {
        setSelectedOcrResult(result);
        setBottomSheetOpen(true);
    };

    const handleCloseBottomSheet = () => {
        setBottomSheetOpen(false);
        setSelectedOcrResult(null);
    };

    const handleEditOcrResult = (key: keyof Attachment, value: string) => {
        if (selectedOcrResult) {
            setSelectedOcrResult({ ...selectedOcrResult, [key]: value });
        }
    };

    const handleSaveOcrResult = () => {
        if (selectedOcrResult) {
            setOcrResults(prevResults => prevResults.map(result =>
                result.url === selectedOcrResult.url ? selectedOcrResult : result
            ));
            handleCloseBottomSheet();
        }
    };

    return (
        <YStack space="$4" padding="$4">
            <XStack space="$4">
                <Button onPress={handlePickFiles} disabled={picking}>
                    <XStack alignItems="center">
                        <FontAwesome name="file" size={16} color="white" />
                        <Text marginLeft="$2">{picking ? "Picking..." : "Pick Files"}</Text>
                        {picking && <Spinner marginLeft="$2" />}
                    </XStack>
                </Button>
                <Button onPress={handleCaptureImage} disabled={capturing}>
                    <XStack alignItems="center">
                        <FontAwesome name="camera" size={16} color="white" />
                        <Text marginLeft="$2">{capturing ? "Capturing..." : "Capture Image"}</Text>
                        {capturing && <Spinner marginLeft="$2" />}
                    </XStack>
                </Button>
            </XStack>
            <Button onPress={handleProcessWithGPT} disabled={isProcessing || filesToProcess.length === 0}>
                <XStack alignItems="center">
                    <FontAwesome name="cogs" size={16} color="white" />
                    <Text marginLeft="$2">{isProcessing ? "Processing..." : "Process"}</Text>
                    {isProcessing && <Spinner marginLeft="$2" />}
                </XStack>
            </Button>

            <ScrollView space="$4">
                {Array.isArray(ocrResults) && ocrResults.length > 0 ? (
                    ocrResults.map((result, index) => (
                        <Card key={index} padding="$4" marginBottom="$4" onPress={() => handleOpenBottomSheet(result)}>
                            <XStack space="$4" alignItems="center" width="100%">
                                <Image source={{ uri: result.url }} style={{ width: 100, height: 100, borderRadius: 8 }} />
                                <YStack space="$2" flex={1}>
                                    <>
                                        <Text>Amount: {result.amount} kr</Text>
                                        <Text>Date: {formatDate(new Date(result.date))}</Text>
                                        <Text numberOfLines={2} ellipsizeMode="tail">Description: {result.description}</Text>
                                    </>
                                </YStack>
                            </XStack>
                        </Card>
                    ))
                ) : (
                    <Text>No results yet</Text>
                )}
            </ScrollView>
            {selectedOcrResult && (
                <EditAttachmentSheet
                    attachment={selectedOcrResult}
                    open={bottomSheetOpen}
                    onOpenChange={handleCloseBottomSheet}
                    handleEditOcrResult={handleEditOcrResult}
                    handleSaveOcrResult={handleSaveOcrResult}
                />
            )}
        </YStack>
    );
}

interface EditAttachmentProps {
    attachment: Attachment;
    onOpenChange: (open: boolean) => void;
    open: boolean;
    handleEditOcrResult: (key: keyof Attachment, value: string) => void;
    handleSaveOcrResult: () => void;
}

function EditAttachmentSheet({ attachment, onOpenChange, open, handleEditOcrResult, handleSaveOcrResult }: EditAttachmentProps) {

    return (
        <Sheet modal snapPoints={[85, 50, 25]} dismissOnSnapToBottom open={open} onOpenChange={onOpenChange}>
            <Sheet.Overlay />
            <Sheet.Handle />
            <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" space="$5">
                <YGroup>
                    <YGroup.Item>
                        <Label>Amount</Label>
                        <Input
                            value={attachment.amount}
                            onChangeText={(text) => handleEditOcrResult('amount', text)}
                            placeholder="Amount"
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <Label>Date</Label>
                        <Input
                            value={attachment.date}
                            onChangeText={(text) => handleEditOcrResult('date', text)}
                            placeholder="Date"
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <Label>Description</Label>
                        <Input
                            value={attachment.description}
                            onChangeText={(text) => handleEditOcrResult('description', text)}
                            placeholder="Description"
                            multiline
                        />
                    </YGroup.Item>
                </YGroup>
                <Button onPress={handleSaveOcrResult}>Save</Button>
            </Sheet.Frame>
        </Sheet>
    );
}
