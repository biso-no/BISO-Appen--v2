import { useState } from 'react';
import { File, pickFiles } from './file-utils';
import { uploadFile } from './appwrite';

export const useFileHandler = (bucketId: string) => {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handlePickFiles = async () => {
        const pickedFiles = await pickFiles();
        if (pickedFiles && pickedFiles.length > 0) {
            setFiles(pickedFiles);
            setError(null);
        } else {
            setError("Failed to pick files.");
        }
    };

    const handleUpload = async ({
        files,
        collection,
        document,
        field,
    }: {
        files: File[],
        collection: string,
        document: string,
        field: string,
    }) => {
        if (files.length > 0) {
            setUploading(true);
            try {
                const uploadPromises = files.map(file => uploadFile(bucketId, file, collection, document, field));
                const urls = await Promise.all(uploadPromises);
                setSuccess(`Files uploaded successfully: ${urls.join(', ')}`);
                setError(null);
            } catch (error) {
                setError("Error uploading files.");
                setSuccess(null);
            } finally {
                setUploading(false);
            }
        } else {
            setError("No files selected to upload.");
        }
    };

    return { handlePickFiles, handleUpload, files, uploading, error, success };
};
