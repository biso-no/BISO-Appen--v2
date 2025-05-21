import { Popover, Avatar, Text, YGroup, styled, Button } from "tamagui";
import { MyImagePicker } from "./image-picker";
import { useState } from "react";
import { ID } from "react-native-appwrite";
import { storage, updateDocument } from "@/lib/appwrite";
import { uriToBlob } from "@/lib/utils/uriToBlob";
import { useAuth } from "./context/core/auth-provider";
import { useProfile } from "./context/core/profile-provider";
import { launchCameraAsync } from "expo-image-picker";
import { File } from "@/lib/file-utils";
import { useTranslation } from 'react-i18next';
import i18next from '@/i18n';

const HighlightedAvatar = styled(Avatar, {
    variants: {
        highlighted: {
            true: {
                borderWidth: 2,
                borderColor: '$blue10'
            },
            false: {}
        }
    }
});

export function ImagePopover() {
    const { t } = useTranslation();
    const [isPressed, setIsPressed] = useState(false);
    const [capturing, setCapturing] = useState(false);

    const { user } = useAuth();
    const { profile } = useProfile();
    const [image, setImage] = useState(profile?.avatar || '');

    const getInitials = (name: string) => {
        return name
          .split(' ')
          .map((n) => n[0])
          .join('');
    };

    const handleImageUpload = async (imageUri: string) => {
        if (!user) {
            return;
        }
        try {
            const blob = await uriToBlob(imageUri); // Convert URI to Blob
            // Create a custom file object that matches the interface expected by uploadFile
            const customFile = {
                name: user.$id + '-profile-image.png', // Set the file name
                type: blob.type,           // Use the MIME type from the blob
                size: blob.size,           // Use the size property from the blob
                uri: imageUri              // Include the original URI
            };

            const result = await storage.createFile('avatars', ID.unique(), customFile);
            if (result?.$id) {
                const imageUrl = storage.getFileView('avatars', result.$id);
                setImage(imageUrl.href); // Ensure you set the image URL after getting the correct URL
                await updateDocument('user', user.$id, { avatar: imageUrl });
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleCaptureImage = async () => {
        setCapturing(true);
        try {
            const result = await launchCameraAsync({
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled && result.assets[0].uri) {
                const newUrl = result.assets[0].uri;
                const blob = await uriToBlob(newUrl);
                const file: File = {
                    name: newUrl.split('/').pop() || 'captured_image',
                    type: 'image/jpeg',
                    size: blob.size,
                    uri: newUrl,
                };
                setImage(file.uri);
                handleImageUpload(file.uri);
            }
        } finally {
            setCapturing(false);
        }
    };

    const handleImageChange = (imageUri: string) => {
        setImage(imageUri);
        handleImageUpload(imageUri);
    };

    if (!user) {
        return null;
    }

    return (
        <Popover size="$5">
            <Popover.Trigger asChild zIndex={100}>
                <HighlightedAvatar
                    circular
                    size={80}
                    highlighted={isPressed}
                    onPressIn={() => setIsPressed(true)}
                    onPressOut={() => setIsPressed(false)}
                >
                    <Avatar.Image src={image || require('@/assets/images/placeholder.png')} />
                    <Avatar.Fallback backgroundColor="gray" alignItems='center' justifyContent='center' borderColor="white" borderWidth={2} borderRadius={50}>
                        <Text fontSize={25}>{getInitials(user.name)}</Text>
                    </Avatar.Fallback>
                </HighlightedAvatar>
            </Popover.Trigger>
            <Popover.Content
                borderWidth={1}
                borderColor="$borderColor"
                enterStyle={{ y: -10, opacity: 0 }}
                exitStyle={{ y: -10, opacity: 0 }}
                elevate
                animation={[
                    'quick',
                    {
                        opacity: {
                            overshootClamping: true,
                        },
                    },
                ]}
            >
                <YGroup gap="$4">
                    <Button onPress={handleCaptureImage} disabled={capturing}>
                        <Text>{t('capture-image')}</Text>
                    </Button>
                    <MyImagePicker image={image} setImage={setImage} handleImageChange={handleImageChange} />
                </YGroup>
            </Popover.Content>
        </Popover>
    );
}
