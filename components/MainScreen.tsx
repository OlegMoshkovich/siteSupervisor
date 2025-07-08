import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import DropDown from './DropDown';
import DynamicDialog from './DynamicDialog';
import colors from './colors';
import PhotoUploadDialog from './PhotoUploadDialog';
import NoteDialog from './NoteDialog';
import MainActionButtons from './MainActionButtons';

// Define the tab param list
type TabParamList = {
  Main: undefined;
  Profile: undefined;
};

type PhotoWithUrl = {
  id: string;
  url: string;
  dataUrl: string | null;
};

// Helper to convert Blob to ArrayBuffer using FileReader
function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

export default function MainScreen(props: any) {
  const [selectedProject, setSelectedProject] = useState('Project 1');
  const [uploading, setUploading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState('');
  const [pendingNote, setPendingNote] = useState('');
  const [pendingUpload, setPendingUpload] = useState(false);
  const [dialogMode, setDialogMode] = useState<'photo' | 'note' | null>(null);
  const [pendingNoteTitle, setPendingNoteTitle] = useState('');
  const [pendingNoteContent, setPendingNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [photoLocation, setPhotoLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const handlePickAndUpload = async () => {
    console.log('Photo icon pressed');
    setDialogMode('photo');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('Media library permission status:', status);
    if (status !== 'granted') {
      Alert.alert('Permission required to access media library!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    console.log('ImagePicker result:', result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const image = result.assets[0];
      setPendingImageUri(image.uri);
      setDialogVisible(true);
      setPendingTitle('');
      setPendingNote('');
      setPendingUpload(false);
      // Get location permission and current location
      try {
        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setPhotoLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } else {
          setPhotoLocation(null);
        }
      } catch (e) {
        setPhotoLocation(null);
      }
    }
  };

  const handlePickCamera = async () => {
    setDialogMode('photo');
    // Request camera permission
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      Alert.alert('Permission required to access camera!');
      return;
    }

    // Optionally, request media library permission if you want to save the photo
    // const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const image = result.assets[0];
      setPendingImageUri(image.uri);
      setDialogVisible(true);
      setPendingTitle('');
      setPendingNote('');
      setPendingUpload(false);
      // Get location permission and current location
      try {
        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setPhotoLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } else {
          setPhotoLocation(null);
        }
      } catch (e) {
        setPhotoLocation(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!pendingImageUri) return;
    setUploading(true);
    setPendingUpload(true);
    try {
      // Get original image size
      const originalResponse = await fetch(pendingImageUri);
      const originalBlob = await originalResponse.blob();
      const originalSize = originalBlob.size;
      console.log('Original image size:', (originalSize / 1024).toFixed(2), 'KB');

      // Compress the image
      const compressed = await ImageManipulator.manipulateAsync(
        pendingImageUri,
        [],
        { compress: 0.05, format: ImageManipulator.SaveFormat.JPEG }
      );
      // Get compressed image size
      const compressedResponse = await fetch(compressed.uri);
      const compressedBlob = await compressedResponse.blob();
      const compressedSize = compressedBlob.size;
      console.log('Compressed image size:', (compressedSize / 1024).toFixed(2), 'KB');

      // Use FileReader to get ArrayBuffer
      const arraybuffer = await blobToArrayBuffer(compressedBlob);
      const fileExt = compressed.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const filename = `${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filename, arraybuffer, {
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        Alert.alert('Upload failed', uploadError.message);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Upload failed', 'User not authenticated');
        return;
      }

      const { error: insertError } = await supabase.from('photos').insert([
        {
          project_id: null,
          user_id: user.id,
          url: uploadData?.path,
          title: pendingTitle,
          note: pendingNote,
          latitude: photoLocation ? photoLocation.latitude : null,
          longitude: photoLocation ? photoLocation.longitude : null,
        },
      ]);

      if (insertError) {
        Alert.alert('DB insert failed', insertError.message);
      } else {
        Alert.alert('Photo uploaded and record created!');
      }
    } catch (err: any) {
      Alert.alert('Upload failed', err.message || 'Unknown error');
    } finally {
      setUploading(false);
      setPendingImageUri(null);
      setDialogVisible(false);
      setPendingTitle('');
      setPendingNote('');
      setPendingUpload(false);
      setPhotoLocation(null);
    }
  };


  useEffect(() => {
    const fetchPhotos = async () => {
      if (!dialogVisible) return;
      setPhotosLoading(true);
      setPhotos([]);

      const { data, error } = await supabase.from('photos').select('*');
      if (error) {
        setPhotosLoading(false);
        return;
      }

      const photosWithDataUrl: PhotoWithUrl[] = await Promise.all(
        data.map(async (photo) => {
          try {
            const { data: fileData, error: fileError } = await supabase.storage.from('photos').download(photo.url);
            if (fileError || !fileData) {
              console.log('Download failed for', photo.url, fileError);
              return { ...photo, dataUrl: null };
            }
            const fr = new FileReader();
            return await new Promise<PhotoWithUrl>((resolve) => {
              fr.onload = () => {
                resolve({ ...photo, dataUrl: fr.result as string });
              };
              fr.readAsDataURL(fileData);
            });
          } catch (e) {
            console.log('Exception for', photo.url, e);
            return { ...photo, dataUrl: null };
          }
        })
      );

      setPhotos(photosWithDataUrl);
      setPhotosLoading(false);
    };

    fetchPhotos();
  }, [dialogVisible]);

  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: 'white', paddingTop: 80 }}>
      <View style={{ width: '86%', flexDirection: 'row', justifyContent: 'space-between' }}>
        <DropDown
          items={['Project 1', 'Project 2', 'Project 3', 'Project 4']}
          selectedItem={selectedProject}
          setSelectedItem={setSelectedProject}
          placeholder="Select a project"
        />
      </View>

      <DynamicDialog
        visible={dialogVisible}
        onClose={() => {
          setDialogVisible(false);
          setPendingImageUri(null);
          setPendingTitle('');
          setPendingNote('');
          setPendingUpload(false);
          setDialogMode(null);
          setPendingNoteTitle('');
          setPendingNoteContent('');
          setSavingNote(false);
        }}
        headerProps={{
          title: dialogMode === 'note' ? 'Note' : 'Image',
          style: { paddingHorizontal: 16 },
          rightActionFontSize: 15,
          titleStyle: { color: colors.primary },
          rightActionElement: 'Close',
          onRightAction: () => {
            setDialogVisible(false);
            setPendingImageUri(null);
            setPendingTitle('');
            setPendingNote('');
            setPendingUpload(false);
            setDialogMode(null);
            setPendingNoteTitle('');
            setPendingNoteContent('');
            setSavingNote(false);
          },
        }}
      >
        {dialogMode === 'photo' ? (
          <PhotoUploadDialog
            visible={dialogVisible && dialogMode === 'photo'}
            imageUri={pendingImageUri}
            title={pendingTitle}
            note={pendingNote}
            uploading={uploading}
            onTitleChange={setPendingTitle}
            onNoteChange={setPendingNote}
            onUpload={handleUpload}
            onClose={() => setDialogVisible(false)}
          />
        )  : (
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Text>No photo selected.</Text>
          </View>
        )}
      </DynamicDialog>

      <MainActionButtons
        buttons={[
          { icon: 'add-outline', onPress: handlePickAndUpload, disabled: false },
          { icon: 'camera', onPress: handlePickCamera, disabled: uploading },
        ]}
      />
    </View>
  );
}
