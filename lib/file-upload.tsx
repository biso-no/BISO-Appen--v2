// FileUpload.tsx
import { Button, YStack, Text } from "tamagui";
import { useFileHandler } from "./useFileHandler";

export function FileUpload({ bucketId }: { bucketId: string }) {
    const { handlePickFile, handleUpload, file, uploading, error, success } = useFileHandler(bucketId);

    return (
        <YStack space="$2" alignItems="center">
            <Button onPress={handlePickFile} disabled={uploading}>
                {uploading ? 'Picking...' : 'Pick File'}
            </Button>
            <Button onPress={handleUpload} disabled={uploading || !file}>
                {uploading ? 'Uploading...' : 'Upload'}
            </Button>
            {file && <Text>Selected: {file.name}</Text>}
            {error && <Text color="red">{error}</Text>}
            {success && <Text color="green">{success}</Text>}
        </YStack>
    );
}
