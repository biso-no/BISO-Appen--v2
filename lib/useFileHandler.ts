import { useState } from 'react';
import { File, pickFiles } from './file-utils';
import { uploadFile } from './appwrite';

interface UploadResult {
    file: string;
    status: "rejected" | "fulfilled";
    url: string | undefined;
    error: any;
  }

  
export const useFileHandler = (bucketId: string) => {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
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
        document?: string,
        field: string,
    }) => {
        if (files.length === 0) {
          setError("No files selected to upload.");
          return;
        }
        setUploading(true);
        try {
          const results = await Promise.allSettled(files.map(file => 
            uploadFile(bucketId, file, collection, field)
          ));
          const formattedResults: UploadResult[] = results.map((result, index) => ({
            file: files[index].name,
            status: result.status,
            url: result.status === 'fulfilled' ? result?.value?.url : undefined, // Assuming result.value has a url property
            error: result.status === 'rejected' ? result.reason : undefined
          }));
          setUploadResults(formattedResults);
          setSuccess(`Files processed: ${formattedResults.filter(r => r.status === 'fulfilled').length}`);
          setError(`Failures: ${formattedResults.filter(r => r.status === 'rejected').length}`);
        } catch (error) {
          setError("Error processing files.");
          setSuccess(null);
        } finally {
          setUploading(false);
        }
      };

    return { handlePickFiles, handleUpload, files, uploading, error, success, uploadResults };
};
