// fileUtils.ts
import * as DocumentPicker from 'expo-document-picker';
import { uploadFile } from "./appwrite";
import { Models } from 'appwrite';

export interface File {
    name: string;
    type: string;
    size: number;
    uri: string;
}

export const pickFile = async (): Promise<File | undefined> => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (!result.canceled && result.assets[0].name && result.assets[0].uri) {
        return {
            name: result.assets[0].name,
            type: result.assets[0].mimeType || '',
            size: result.assets[0].size || 0,
            uri: result.assets[0].uri,
        };
    }
};

export const upload = async (bucketId: string, file: File): Promise<Models.File> => {
    const result = await uploadFile(bucketId, file);
    if (!result) {
        throw new Error("Failed to upload file.");
    }
    return result;
};