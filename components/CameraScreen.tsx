import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';

interface CameraScreenProps {
  onPhotoTaken: (photo: { uri: string }) => void;
  onClose: () => void;
}

export default function CameraScreen({ onPhotoTaken, onClose }: CameraScreenProps) {
  const [hasPermission, setHasPermission] = useState<null | boolean>(null);
  const cameraRef = useRef<any>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      onPhotoTaken(photo);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
        <Text style={{ color: '#fff' }}>Capture</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={{ color: '#fff' }}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  captureButton: {
    position: 'absolute',
    bottom: 40,
    left: '50%',
    marginLeft: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'colors.primary',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 20,
  },
});
