import { useState } from "react";
import { Button, Image, View } from "tamagui";
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerProps {
    image: string
    setImage: any
}

export function MyImagePicker({image, setImage}: ImagePickerProps) {

    const pickImage = async () => {

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        }); 

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    return (
        <Button onPress={pickImage}>Pick an image</Button>
    )
}