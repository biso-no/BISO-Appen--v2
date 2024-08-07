import { MyStack } from "@/components/ui/MyStack";
import { YStack, Label, YGroup, Input, Button, H3, Text, XStack, Separator, Image } from "tamagui";
import { useState } from "react";
import { useAuth } from "@/components/context/auth-provider";
import { databases, storage } from "@/lib/appwrite";
import { ID } from "react-native-appwrite";
import { pickFiles } from "@/lib/file-utils";

export interface File {
    name: string;
    type: string;
    size: number;
    uri: string;
}

export default function BugReportScreen() {
    const { data } = useAuth();

    const [description, setDescription] = useState<string>("");
    const [images, setImages] = useState<File[]>([]);
    const [uploadedImageUris, setUploadedImageUris] = useState<string[]>([]);

    const handlePickFiles = async () => {
        const result = await pickFiles();
        if (result) {
            const newFiles = result.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size,
                uri: file.uri,
            }));
            setImages(prev => [...prev, ...newFiles]);
        }
    };

    const handleSubmit = async () => {
        if (!data) {
            return;
        }

        for (const image of images) {
            const blob = await storage.createFile('bug_reports', ID.unique(), image);
            setUploadedImageUris(prev => [...prev, blob.$id]);
        }

        await databases.createDocument('app', 'bug_reports', ID.unique(), {
            description,
            user: data.$id,
            user_id: data.$id,
            images: uploadedImageUris,
        });
    };

    return (
        <MyStack>
            <YStack space="$4" alignItems="center" justifyContent="center" padding="$4">
                <H3>Report a Bug</H3>
                <YGroup space="$2"></YGroup>
                <Label htmlFor="description">Description</Label>
                <Input
                    id="description"
                    placeholder="Describe the issue..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={5}
                    width="100%"
                />
                <Separator />
                <Button onPress={handlePickFiles} theme="primary">
                    <Text>Upload Image</Text>
                </Button>
                <YStack space="$2">
                    {images.map((image, index) => (
                        <XStack key={index} alignItems="center" space="$2">
                            <Image source={{ uri: image.uri }} width={50} height={50} />
                            <Text>{image.name}</Text>
                        </XStack>
                    ))}
                </YStack>
                <Separator />
                <Button onPress={handleSubmit} theme="accent" themeInverse>
                    <Text>Submit</Text>
                </Button>
            </YStack>
        </MyStack>
    );
}
