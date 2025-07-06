import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import DropDown from './DropDown';
import DynamicDialog from './DynamicDialog';
import colors from './colors';
import CheckBox from './CheckBox';
import Loader from './Loader';

// Define the tab param list
type TabParamList = {
  Main: undefined;
  Profile: undefined;
};

type PhotoWithUrl = {
  id: string;
  url: string;
  dataUrl: string | null;
  title?: string;
  note?: string;
};

export default function RetrieveScreen(props: any) {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const [selectedProject, setSelectedProject] = useState ('Project 1');
  const [uploading, setUploading] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(true);
  const { width } = Dimensions.get('window');
  const [selectedDate, setSelectedDate] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [checkedPhotos, setCheckedPhotos] = useState<{ [id: string]: boolean }>({});
  const [PhotoAccordionOpen, setPhotoAccordionOpen] = useState(false);
  const [NotesAccordionOpen, setNotesAccordionOpen] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | 'notes'>('photos');

  const handlePickAndUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required to access photo library!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const image = result.assets[0];
      try {
        setUploading(true);
        const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());
        const fileExt = image.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
        const filename = `${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filename, arraybuffer, {
            contentType: image.mimeType ?? 'image/jpeg',
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
            metadata: { note: 'Test upload from library' },
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
      }
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

  useEffect(() => {
    if (activeTab !== 'notes') return;
    setNotesLoading(true);
    setNotes([]);
    const fetchNotes = async () => {
      const { data, error } = await supabase.from('notes').select('*');
      if (error) {
        setNotesLoading(false);
        return;
      }
      setNotes(data);
      setNotesLoading(false);
    };
    fetchNotes();
  }, [activeTab]);

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
      {selectedProject && (
        <View style={{ marginTop: 220}}>
          <DropDown
            items={['June 1', 'June 2', 'June 3', 'June 4']}
            selectedItem={selectedDate}
            placeholder="Select a date"
            setSelectedItem={(date) => {
              setSelectedDate(date);
              setDialogVisible(true);
            }}
          />
        </View>
      )}

      <DynamicDialog
        visible={dialogVisible}
        headerProps={{
          title: 'June 2, 2025',
          rightActionFontSize: 15,
          style: { paddingHorizontal: 16 },
          titleStyle: { color: 'black' },
          rightActionElement: 'Close',
          onRightAction: () => setDialogVisible(false),
          onHeaderPress: () => setDialogVisible(false),
          onBackAction: () => setDialogVisible(false),
        }}
        onClose={() => setDialogVisible(false)}
      >
        {photosLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* <ActivityIndicator size="large" color={'#d42a02'} /> */}
            <Loader />
          </View>
        ) : photos.length === 0 ? (
          <Text style={{ alignSelf: 'center', marginTop: 0 }}>No photos available.</Text>
        ) : (
          <>
            <View style={{ width: '100%', justifyContent: 'flex-start' }}>
              {/* Tab Bar */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: 3,
                    borderBottomColor: activeTab === 'photos' ? colors.primary : 'transparent',
                    backgroundColor: activeTab === 'photos' ? '#fff4f0' : 'white',
                  }}
                  onPress={() => setActiveTab('photos')}
                >
                  <Text style={{ fontSize: 16, color: activeTab === 'photos' ? colors.primary : '#888' }}>Photos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: 3,
                    borderBottomColor: activeTab === 'notes' ? colors.primary : 'transparent',
                    backgroundColor: activeTab === 'notes' ? '#fff4f0' : 'white',
                  }}
                  onPress={() => setActiveTab('notes')}
                >
                  <Text style={{ fontSize: 16, color: activeTab === 'notes' ? colors.primary : '#888' }}>Notes</Text>
                </TouchableOpacity>
              </View>

              {/* Tab Content */}
              {activeTab === 'photos' && (
                <ScrollView  contentContainerStyle={{ padding: 0 }}>
                  {photos.map((photo) =>
                    photo.dataUrl ? (
                      <View
                        key={photo.id}
                        style={{ marginBottom: 24, alignItems: 'center' }}
                      >
                        <Image
                          source={{ uri: photo.dataUrl }}
                          style={{
                            width: 300,
                            height: 300,
                            marginBottom: 10,
                            borderRadius: 8,
                            alignSelf: 'center',
                          }}
                        />
                        {photo.title ? (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              width: 300,
                              alignSelf: 'center',
                              marginBottom: 4,
                            }}
                          >
                            <Text
                              style={{
                                flex: 1,
                                fontWeight: 'bold',
                                fontSize: 18,
                                color: '#222',
                              }}
                            >
                              {photo.title}
                            </Text>
                            <CheckBox
                              checked={!!checkedPhotos[photo.id]}
                              onChange={(checked) =>
                                setCheckedPhotos((prev) => ({ ...prev, [photo.id]: checked }))
                              }
                              size={32}
                            />
                          </View>
                        ) : null}
                        {photo.note ? (
                          <Text
                            style={{
                              width: 300,
                              fontSize: 16,
                              color: '#444',
                              alignSelf: 'center',
                              marginBottom: 4,
                            }}
                          >
                            {photo.note}
                          </Text>
                        ) : null}
                      </View>
                    ) : null
                  )}
                </ScrollView>
              )}
              {activeTab === 'notes' && (
                <ScrollView contentContainerStyle={{ padding: 0 }}>
                  {notesLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                      {/* <ActivityIndicator size="large" color={'#d42a02'} /> */}
                      <Loader />
                    </View>
                  ) : notes.length === 0 ? (
                    <Text style={{ alignSelf: 'center', marginTop: 0 }}>No notes available.</Text>
                  ) : (
                    notes.map((note) => (
                      <View
                        key={note.id}
                        style={{ marginBottom: 24, alignItems: 'center' }}
                      >
                        <Text
                          style={{
                            width: 300,
                            fontWeight: 'bold',
                            fontSize: 18,
                            color: '#222',
                            alignSelf: 'center',
                            marginBottom: 4,
                          }}
                        >
                          {note.title}
                        </Text>
                        <Text
                          style={{
                            width: 300,
                            fontSize: 16,
                            color: '#444',
                            alignSelf: 'center',
                            marginBottom: 4,
                          }}
                        >
                          {note.content}
                        </Text>
                      </View>
                    ))
                  )}
                </ScrollView>
              )}
            </View>

            {/* Generate Report button fixed at the bottom of the dialog */}
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                paddingBottom: 2,
                paddingTop: 16,
                backgroundColor: 'white',
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: '#d42a02',
                  borderRadius: 100,
                  paddingVertical: 10,
                  paddingHorizontal: 32,
                  shadowColor: '#000',
                  shadowOffset: { width: 3, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: Object.values(checkedPhotos).some(Boolean) ? 1 : 0.5,
                }}
                onPress={() => {
                  /* handle action for selected photos here */
                }}
                disabled={!Object.values(checkedPhotos).some(Boolean)}
              >
                <Text style={{ color: 'white', fontSize: 16 }}>Generate Report</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </DynamicDialog>
    </View>
  );
}
