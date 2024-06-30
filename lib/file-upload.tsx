import React, { useState } from "react";
import { Button, YStack, Text, XStack, Image, YGroup, ListItem, Separator } from "tamagui";
import { useFileHandler } from "./useFileHandler";
import { launchCameraAsync } from 'expo-image-picker'; // If you're using Expo
import { uriToBlob } from "./utils/uriToBlob";
import { MyStack } from "@/components/ui/MyStack";
import { File } from "./file-utils";
import { storage, triggerFunction } from "./appwrite";
import { ID, Models } from "react-native-appwrite";
import { pickFiles } from "./file-utils";
import MlkitOcr from 'react-native-mlkit-ocr';

interface OcrResults {
    url: string;
    description: string;
    date: string;
    amount: string;
}

export function FileUpload({ bucketId, expenseId }: { bucketId: string, expenseId: string }) {
    const { files, uploading, error, success } = useFileHandler(bucketId);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [capturing, setCapturing] = useState(false);
    const [picking, setPicking] = useState(false);
    const [filesToProcess, setFilesToProcess] = useState<File[]>([]);
    const [ocrResults, setOcrResults] = useState<Models.Execution[]>([]);

    const handleCaptureImage = async () => {
        setCapturing(true);
        try {
            let result = await launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
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

    const handleProcessWithGPT = async () => {
        console.log(filesToProcess);
        if (filesToProcess.length > 0) {
            for (const file of filesToProcess) {
                try {
                    // Perform OCR on the image
                    const ocrResult = await MlkitOcr.detectFromUri(file.uri);
                    const extractedText = ocrResult.map(block => block.text).join(' ');

                    // Send the extracted text to OpenAI for processing
                    const functionResults = await triggerFunction({
                        functionId: 'process_receipts',
                        data: extractedText,
                        async: true,
                    }   
                    );

                    console.log(functionResults);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    };


    const handlePickFilesWithState = async () => {
        setPicking(true);
        try {
            const result = await pickFiles();
            if (result) {
                setFilesToProcess(prev => [...prev, ...result]);
                setPreviewUrls(prev => [...prev, ...result.map(file => file.uri)]);
            }
        } finally {
            setPicking(false);
        }
    };

    return (
        <YStack space="$4">
            <YGroup space="$2">
                <XStack space="$2" justifyContent="center">
                    <Button onPress={handlePickFilesWithState} disabled={uploading || picking}>
                        {picking ? 'Picking...' : 'Pick Files'}
                    </Button>
                    <Button onPress={handleCaptureImage} disabled={capturing}>
                        {capturing ? 'Capturing...' : 'Capture Image'}
                    </Button>
                </XStack>
                <YStack space="$2" alignItems="center">
                    {previewUrls.map((url, index) => (
                        <Image key={index} source={{ uri: url }} width={200} height={200} />
                    ))}
                </YStack>
                <Button onPress={() => handleProcessWithGPT()} variant="outlined">
                    {uploading ? 'Uploading...' : 'Process with GPT'}
                </Button>
            </YGroup>
            <YGroup>
                {files.map((file, index) => (
                    <YGroup.Item key={index}>
                        <ListItem>{file.name}</ListItem>
                        <Separator direction="rtl" />
                    </YGroup.Item>
                ))}
            </YGroup>
            {error && <Text color="red">{error}</Text>}
            {success && <Text color="green">{success}</Text>}
        </YStack>
    );
}
