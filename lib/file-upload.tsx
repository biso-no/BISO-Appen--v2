import React, { useState } from "react";
import { Button, YStack, Text, XStack, Image, ScrollView, Card, Spinner, Input, Sheet, YGroup, Label } from "tamagui";
import { useFileHandler } from "./useFileHandler";
import { launchCameraAsync } from 'expo-image-picker';
import { uriToBlob } from "./utils/uriToBlob";
import { File } from "./file-utils";
import { triggerFunction } from "./appwrite";
import { pickFiles } from "./file-utils";
import MlkitOcr from 'react-native-mlkit-ocr';
import { formatDate } from "./format-time";
import { File as FileIcon, Camera, Plus, FileCog } from "@tamagui/lucide-icons";
import { DateTimePicker } from "@/components/ui/date-picker";

interface Attachment {
    url: string;
    description: string;
    date: Date;
    amount: number;
    type: 'pdf' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'heic'
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
                continue;
            }

            if (file.type === 'application/pdf') {
                const result: Attachment = {
                    url: file.uri,
                    description: '',
                    date: new Date(),
                    amount: 0,
                    type: 'pdf',
                };
                newOcrResults.push(result);
                ocrResultsCopy.push(result);
            } else {
                try {
                    const ocrResult = await MlkitOcr.detectFromUri(file.uri);
                    const extractedText = ocrResult.map(block => block.text).join(' ');
                    const functionResults = await triggerFunction({
                        functionId: 'process_receipts',
                        data: extractedText,
                        async: false,
                    });

                    if (functionResults.responseBody) {
                        const responseBody = JSON.parse(functionResults.responseBody);
                        const result: Attachment = {
                            url: file.uri,
                            description: responseBody.description,
                            date: responseBody.date,
                            amount: responseBody.amount,
                            type: file.type.split('/')[1] as 'pdf' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'heic',
                        };
                        newOcrResults.push(result);
                        ocrResultsCopy.push(result);
                    }
                } catch (error) {
                    console.error(`Error processing file ${file.name}: `, error);
                }
            }
        }

        setOcrResults(ocrResultsCopy);
        setFilesToProcess([]);
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
            setSelectedOcrResult((prev) => {
                if (!prev) return null;
    
                let updatedValue: any = value;
                if (key === 'date') {
                    updatedValue = new Date(value);
                } else if (key === 'amount') {
                    // Ensure the amount is a valid float
                    updatedValue = parseFloat(value);
                    if (isNaN(updatedValue)) {
                        updatedValue = 0; // or handle it appropriately
                    }
                }
    
                return { ...prev, [key]: updatedValue };
            });
        }
    };
    

    const handleSaveOcrResult = () => {
        if (selectedOcrResult) {
            setOcrResults((prevResults) => prevResults.map(result =>
                result.url === selectedOcrResult.url ? {
                    ...selectedOcrResult,
                    date: new Date(selectedOcrResult.date)
                } : result
            ));
            handleCloseBottomSheet();
        }
    };

    

    const handleDeleteResult = () => {
        if (selectedOcrResult) {
            setOcrResults((prevResults) => prevResults.filter(result => result.url !== selectedOcrResult.url));
            handleCloseBottomSheet();
        }
    }

    return (
        <YStack space="$4" padding="$4">
            <XStack space="$4">
                <Button onPress={handlePickFiles} disabled={picking}>
                    <XStack alignItems="center">
                        <FileIcon size={16} />
                        <Text marginLeft="$2">{picking ? "Picking..." : "Pick Files"}</Text>
                        {picking && <Spinner marginLeft="$2" />}
                    </XStack>
                </Button>
                <Button onPress={handleCaptureImage} disabled={capturing}>
                    <XStack alignItems="center">
                        <Camera size={16} />
                        <Text marginLeft="$2">{capturing ? "Capturing..." : "Capture Image"}</Text>
                        {capturing && <Spinner marginLeft="$2" />}
                    </XStack>
                </Button>
            </XStack>
            <Button onPress={handleProcessWithGPT} disabled={isProcessing || filesToProcess.length === 0}>
                <XStack alignItems="center">
                    <FileCog size={16} />
                    <Text marginLeft="$2">{isProcessing ? "Processing..." : "Process"}</Text>
                    {isProcessing && <Spinner marginLeft="$2" />}
                </XStack>
            </Button>

            <ScrollView space="$4">
                {ocrResults.length > 0 ? (
                    ocrResults.map((result) => (
                        <Card key={result.url} padding="$4" marginBottom="$4" onPress={() => handleOpenBottomSheet(result)}>
                            <XStack space="$4" alignItems="center" width="100%">
                                <Image source={{ uri: result.url }} style={{ width: 100, height: 100, borderRadius: 8 }} />
                                <YStack space="$2" flex={1}>
                                    <Text>Amount: {result.amount} kr</Text>
                                    <Text>Date: {formatDate(new Date(result.date))}</Text>
                                    <Text numberOfLines={2} ellipsizeMode="tail">Description: {result.description}</Text>
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
                    handleDeleteResult={handleDeleteResult}
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
    handleDeleteResult: () => void;
}

function EditAttachmentSheet({ attachment, onOpenChange, open, handleEditOcrResult, handleSaveOcrResult, handleDeleteResult }: EditAttachmentProps) {
    return (
        <Sheet modal snapPoints={[85, 50, 25]} dismissOnSnapToBottom open={open} onOpenChange={onOpenChange}>
            <Sheet.Overlay />
            <Sheet.Handle />
            <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" space="$5">
                <YGroup width="$20">
                    <YGroup.Item>
                        <Label>Amount</Label>
                        <Input
                            value={attachment.amount.toString()}
                            onChangeText={(text) => handleEditOcrResult('amount', text.toString())}
                            placeholder="Amount"
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <Label>Date</Label>
                        <DateTimePicker
                            date={attachment.date || new Date()}
                            type="date"
                            onChange={(date) => handleEditOcrResult('date', date.toISOString())} // Only pass back the date in a single callback
                            confirmText="Confirm"
                            cancelText="Cancel"
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
                <Button onPress={handleDeleteResult}>Delete</Button>
            </Sheet.Frame>
        </Sheet>
    );
}