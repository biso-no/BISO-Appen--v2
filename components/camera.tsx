import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, Text, View } from 'tamagui';
import { Pressable } from 'react-native';
import type { CameraType } from 'expo-camera';

export function MyCamera() {
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission}>grant permission</Button>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }


  return (
    <View flex={1} justifyContent='center' alignItems='center'>
      <CameraView
        style={{ flex: 1 }}
        facing={facing}
        
        >
            <Pressable onPress={toggleCameraFacing}>
                <Text>Flip</Text>
            </Pressable>
        </CameraView>
    </View>
  );
}