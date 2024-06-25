import { Button } from "tamagui";
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerProps {
    image: string;
    setImage: React.Dispatch<React.SetStateAction<string>>;
    handleImageChange: (imageUri: string) => void; // Add handleImageChange prop
}

export function MyImagePicker({ image, setImage, handleImageChange }: ImagePickerProps) {

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            handleImageChange(result.assets[0].uri); // Call handleImageChange with the URI
        }
    };

    return (
        <Button onPress={pickImage}>Pick an image</Button>
    );
}
