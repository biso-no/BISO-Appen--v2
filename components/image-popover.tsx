import { Popover, Image, Avatar, Text, YGroup, styled } from "tamagui";
import { MyImagePicker } from "./image-picker";
import { MyCamera } from "./camera";
import { useState } from "react";
import { Models } from "react-native-appwrite";
import { Camera } from "@tamagui/lucide-icons";
import { uploadFile } from "@/lib/appwrite";
import { uriToBlob } from "@/lib/utils/uriToBlob";

interface Props {
    initialAvatar: string;
    name: string;
}

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

export function ImagePopover({ initialAvatar, name}: Props) {
    const [image, setImage] = useState('');
    const [isPressed, setIsPressed] = useState(false);

    const avatar = image ? image : initialAvatar;
    const useInitials = (name: string) => {
        return name
          .split(' ')
          .map((n) => n[0])
          .join('');
    };

    const handleImageUpload = async (imageUri: string) => {
        try {
            const blob = await uriToBlob(imageUri); // Convert URI to Blob
    
            // Create a custom file object that matches the interface expected by uploadFile
            const customFile = {
                name: 'profile-image.png', // Set the file name
                type: blob.type,           // Use the MIME type from the blob
                size: blob.size,           // Use the size property from the blob
                uri: imageUri              // Include the original URI
            };
    
            const result = await uploadFile('avatars', customFile); // Upload the file
            console.log('File uploaded successfully', result);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };
    
    
    

    const handleImageChange = (imageUri: string) => {
        setImage(imageUri);
        handleImageUpload(imageUri);
    };

    return (
        <Popover size="$5">
            <Popover.Trigger asChild>
                <HighlightedAvatar
                    circular
                    size={100}
                    highlighted={isPressed}
                    onPressIn={() => setIsPressed(true)}
                    onPressOut={() => setIsPressed(false)}
                >
                    <Avatar.Image src={avatar?.toString()} />
                    <Avatar.Fallback backgroundColor="$blue10" alignItems='center' justifyContent='center'>
                        <Text fontSize={40}>{useInitials(name)}</Text>
                    </Avatar.Fallback>
                    <Camera size={60} color="#FFFFFF" opacity={0.6} />
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
