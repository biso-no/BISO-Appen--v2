import * as DocumentPicker from 'expo-document-picker';

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

export const pickFiles = async (): Promise<File[]> => {
    const result = await DocumentPicker.getDocumentAsync({ 
        type: 'application/pdf,image/*', // Allows PDFs and all image types
        copyToCacheDirectory: true, 
        multiple: true 
    });
    
    if (!result.canceled && result.assets[0].name && result.assets[0].uri) {
        return result.assets.map((asset) => ({
            name: asset.name,
            type: asset.mimeType || '',
            size: asset.size || 0,
            uri: asset.uri,
        }));
    }
    return [];
};
