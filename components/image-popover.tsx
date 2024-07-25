import { Popover, Image, Avatar, Text, YGroup, styled } from "tamagui";
import { MyImagePicker } from "./image-picker";
import { MyCamera } from "./camera";
import { useState } from "react";
import { Models } from "react-native-appwrite";
import { Camera } from "@tamagui/lucide-icons";
import { getUserAvatar, uploadFile } from "@/lib/appwrite";
import { uriToBlob } from "@/lib/utils/uriToBlob";
import { useAuth } from "./context/auth-provider";

const CameraIcon = styled(Image, {
    position: 'absolute',
    width: 40,
    height: 40,
    opacity: 0.5,
    tintColor: '#FFFFFF', // Adjust the color if needed
    alignSelf: 'center',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }]
});

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
    const [image, setImage] = useState('');
    const [isPressed, setIsPressed] = useState(false);

    const { data, profile, isLoading } = useAuth();

    const avatarId = profile?.avatar_id;
    const initialAvatar = getUserAvatar(avatarId);

    const avatar = image ? image : initialAvatar;
    const useInitials = (name: string) => {
        return name
          .split(' ')
          .map((n) => n[0])
          .join('');
    };

    const handleImageUpload = async (imageUri: string) => {

        if (!data) {
            return;
        }
        try {
            const blob = await uriToBlob(imageUri); // Convert URI to Blob
    
            // Create a custom file object that matches the interface expected by uploadFile
            const customFile = {
                name: 'profile-image.png', // Set the file name
                type: blob.type,           // Use the MIME type from the blob
                size: blob.size,           // Use the size property from the blob
                uri: imageUri              // Include the original URI
            };
    
            const result = await uploadFile('avatars', customFile, 'user', data.$id, 'avatar_id'); // Upload the file
            console.log('File uploaded successfully', result);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };
    
    
    

    const handleImageChange = (imageUri: string) => {
        setImage(imageUri);
        handleImageUpload(imageUri);
    };

    if (!data) {
        return null;
    }

    return (
        <Popover size="$5">
            <Popover.Trigger asChild zIndex={100}>
                <HighlightedAvatar
                    circular
                    size={50}
                    highlighted={isPressed}
                    onPressIn={() => setIsPressed(true)}
                    onPressOut={() => setIsPressed(false)}
                >
                    <Avatar.Image src={avatar?.toString()} />
                    <Avatar.Fallback backgroundColor="gray" alignItems='center' justifyContent='center' borderColor="white" borderWidth={2} borderRadius={50}>
                        <Text fontSize={25}>{useInitials(data.name)}</Text>
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
                <YGroup space="$4">
                    <MyCamera />
                    <MyImagePicker image={image} setImage={setImage} handleImageChange={handleImageChange} />
                </YGroup>
            </Popover.Content>
        </Popover>
    );
}
