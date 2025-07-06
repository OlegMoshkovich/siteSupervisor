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
                console.log('Loaded dataUrl for', photo.url);
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
        {dialogMode === 'photo' && pendingImageUri ? (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' }}>
              <TextInput
                placeholder="Add a title (optional)"
                value={pendingTitle}
                onChangeText={setPendingTitle}
                style={{
                  width: 300,
                  minHeight: 40,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  marginBottom: 16,
                  fontSize: 16,
                  backgroundColor: '#fafafa',
                }}
                editable={!uploading}
              />
              <TextInput
                placeholder="Add a note (optional)"
                value={pendingNote}
                onChangeText={setPendingNote}
                multiline={true}
                style={{
                  width: 300,
                  minHeight: 80,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  marginBottom: 16,
                  fontSize: 16,
                  backgroundColor: '#fafafa',
                }}
                editable={!uploading}
              />
              <Image
                source={{ uri: pendingImageUri }}
                style={{ width: 300, height: 300, borderRadius: 12, marginBottom: 16 }}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={handleUpload}
                style={{
                  backgroundColor: '#d42a02',
                  borderRadius: 100,
                  paddingVertical: 12,
                  paddingHorizontal: 32,
                  marginBottom: 8,
                  marginTop: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 3, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={'#fff'} />
                ) : (
                  <Text style={{ color: 'white', fontSize: 16 }}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        ) : dialogMode === 'note' ? (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' }}>
              <TextInput
                placeholder="Note title"
                value={pendingNoteTitle}
                onChangeText={setPendingNoteTitle}
                style={{
                  width: 300,
                  minHeight: 40,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  marginBottom: 16,
                  fontSize: 16,
                  backgroundColor: '#fafafa',
                }}
                editable={!savingNote}
              />
              <TextInput
                placeholder="Note content"
                value={pendingNoteContent}
                onChangeText={setPendingNoteContent}
                multiline={true}
                style={{
                  width: 300,
                  minHeight: 80,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  marginBottom: 16,
                  fontSize: 16,
                  backgroundColor: '#fafafa',
                }}
                editable={!savingNote}
              />
              <TouchableOpacity
                onPress={handleSaveNote}
                style={{
                  backgroundColor: '#d42a02',
                  borderRadius: 100,
                  paddingVertical: 12,
                  paddingHorizontal: 32,
                  marginBottom: 8,
                  marginTop: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 3, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: pendingNoteTitle.trim() && pendingNoteContent.trim() ? 1 : 0.5,
                }}
                disabled={savingNote || !pendingNoteTitle.trim() || !pendingNoteContent.trim()}
              >
                {savingNote ? (
                  <ActivityIndicator size="small" color={'#fff'} />
                ) : (
                  <Text style={{ color: 'white', fontSize: 16 }}>Save Note</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Text>No photo selected.</Text>
          </View>
        )}
      </DynamicDialog>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 200, width: '86%' }}>
        {selectedProject &&
          [
            { icon: 'document-text', onPress: handleOpenNoteDialog, disabled: false },
            { icon: 'camera', onPress: handlePickAndUpload, disabled: uploading, isUploading: true },
            // { icon: 'mic', onPress: undefined, disabled: false },
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={item.onPress}
              disabled={item.disabled}
              style={{
                margin: 6,     
                width: 91, // ~5.7em at 16px base
                height: 91,
                borderRadius: 1000,
                backgroundColor: '#545251',
                borderWidth: 0,
                // backgroundColor: '#c7c3c0',
                shadowColor: '#000',
                shadowOffset: { width: 10, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 8,
                // Simulate inner shadow/highlight with border and overlay
                // (React Native doesn't support inset shadow, so we approximate)
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  borderColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={item.icon as any} size={32} color="white" />
              </View>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );
}
