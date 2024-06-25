import React, { useState } from "react";
import { Button, YStack, Text, XStack, Image, YGroup, ListItem, Separator } from "tamagui";
import { useFileHandler } from "./useFileHandler";
import { launchCameraAsync } from 'expo-image-picker'; // If you're using Expo
import { uriToBlob } from "./utils/uriToBlob";
import { MyStack } from "@/components/ui/MyStack";
import { File } from "./file-utils";

export function FileUpload({ bucketId }: { bucketId: string }) {
    const { handlePickFiles, handleUpload, files, uploading, error, success } = useFileHandler(bucketId);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const handleCaptureImage = async () => {
        let result = await launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        
        if (!result.canceled && result.assets[0].uri) {
            const newUrl = result.assets[0].uri;
            setPreviewUrls((prev) => [...prev, newUrl]);
            const blob = await uriToBlob(newUrl);
            const file: File = {
                name: newUrl.split('/').pop() || 'captured_image',
                type: 'image/jpeg',
                size: blob.size,
                uri: newUrl,
            };
            handleUpload({ files: [file], collection: 'expense_attachments', document: 'yourDocument', field: 'yourField' });
        }
    };

    return (
        <YStack space="$4">
            <YGroup space="$2">
            <XStack space="$2" justifyContent="center">
                <Button onPress={handlePickFiles} disabled={uploading}>
                    {uploading ? 'Picking...' : 'Pick Files'}
                </Button>
                <Button onPress={handleCaptureImage} disabled={uploading}>
                    {uploading ? 'Capturing...' : 'Capture Image'}
                </Button>
            </XStack>
            <YStack space="$2" alignItems="center">
                {previewUrls.map((url, index) => (
                    <Image key={index} source={{ uri: url }} width={200} height={200} />
                ))}
            </YStack>
            <Button onPress={() => handleUpload({ files, collection: 'yourCollection', document: 'yourDocument', field: 'yourField' })} disabled={uploading || files.length === 0} variant="outlined">
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
