// useFileHandler.ts
import { useState } from 'react';
import { File, pickFile, upload } from './file-utils';

export const useFileHandler = (bucketId: string) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handlePickFile = async () => {
        const pickedFile = await pickFile();
        if (pickedFile) {
            setFile(pickedFile);
            setError(null);
        } else {
            setError("Failed to pick a file.");
        }
    };

    const handleUpload = async () => {
        if (file) {
            setUploading(true);
            try {
                const url = await upload(bucketId, file);
                setSuccess(`File uploaded successfully: ${url}`);
                setError(null);
            } catch (error) {
                setError("Error uploading file.");
                setSuccess(null);
            } finally {
                setUploading(false);
            }
        } else {
            setError("No file selected to upload.");
        }
    };

    return { handlePickFile, handleUpload, file, uploading, error, success };
};
