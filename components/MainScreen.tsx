import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
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

export default function MainScreen(props: any) {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const [selectedProject, setSelectedProject] = useState('Project 1');
  const [uploading, setUploading] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(true);
  const { width } = Dimensions.get('window');
  const [selectedDate, setSelectedDate] = useState('');
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

  const handlePickAndUpload = async () => {
    setDialogMode('photo');
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required to access camera!');
      return;
    }

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
    }
  };

  const handleUpload = async () => {
    if (!pendingImageUri) return;
    setUploading(true);
    setPendingUpload(true);
    try {
      const arraybuffer = await fetch(pendingImageUri).then((res) => res.arrayBuffer());
      const fileExt = pendingImageUri.split('.').pop()?.toLowerCase() ?? 'jpeg';
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
    }
  };

  const handleOpenNoteDialog = () => {
    setDialogMode('note');
    setDialogVisible(true);
    setPendingNoteTitle('');
    setPendingNoteContent('');
    setSavingNote(false);
  };

  const handleSaveNote = async () => {
    if (!pendingNoteTitle.trim() || !pendingNoteContent.trim()) return;
    setSavingNote(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Save failed', 'User not authenticated');
        return;
      }
      const { error: insertError } = await supabase.from('notes').insert([
        {
          user_id: user.id,
          title: pendingNoteTitle,
          content: pendingNoteContent,
        },
      ]);
      if (insertError) {
        Alert.alert('DB insert failed', insertError.message);
      } else {
        Alert.alert('Note saved!');
        setDialogVisible(false);
        setDialogMode(null);
        setPendingNoteTitle('');
        setPendingNoteContent('');
      }
    } catch (err: any) {
      Alert.alert('Save failed', err.message || 'Unknown error');
    } finally {
      setSavingNote(false);
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
        ) : dialogMode === 'note' ? (
          <NoteDialog
            visible={dialogVisible && dialogMode === 'note'}
            title={pendingNoteTitle}
            content={pendingNoteContent}
            saving={savingNote}
            onTitleChange={setPendingNoteTitle}
            onContentChange={setPendingNoteContent}
            onSave={handleSaveNote}
            onClose={() => setDialogVisible(false)}
          />
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Text>No photo selected.</Text>
          </View>
        )}
      </DynamicDialog>

      <MainActionButtons
        buttons={[
          { icon: 'document-text', onPress: handleOpenNoteDialog, disabled: false },
          { icon: 'camera', onPress: handlePickAndUpload, disabled: uploading },
        ]}
      />
    </View>
  );
}
