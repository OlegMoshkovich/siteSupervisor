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
import Constants from 'expo-constants';

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
  const [activeTab, setActiveTab] = useState<'photos' | 'notes' | 'summaries'>('photos');
  const [checkedNotes, setCheckedNotes] = useState<{ [id: string]: boolean }>({});
  const [summaries, setSummaries] = useState<any[]>([]);
  const [summariesLoading, setSummariesLoading] = useState(false);

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

  useEffect(() => {
    if (activeTab !== 'summaries') return;
    setSummariesLoading(true);
    setSummaries([]);
    const fetchSummaries = async () => {
      const { data, error } = await supabase.from('summaries').select('*').order('created_at', { ascending: false });
      if (error) {
        setSummariesLoading(false);
        return;
      }
      setSummaries(data);
      setSummariesLoading(false);
    };
    fetchSummaries();
  }, [activeTab]);

  const handleOpenNoteDialog = () => {
    Alert.alert('Note dialog not implemented yet');
  };

  const handleGenerateReport = async () => {
    // Gather checked photo notes/titles
    const selectedPhotoNotes = photos
      .filter(photo => checkedPhotos[photo.id])
      .map(photo => photo.note || photo.title || '')
      .filter(Boolean);

    // Gather checked note contents/titles
    const selectedNoteContents = notes
      .filter(note => checkedNotes[note.id])
      .map(note => note.content || note.title || '')
      .filter(Boolean);

    // Combine all descriptions
    const allDescriptions = [...selectedPhotoNotes, ...selectedNoteContents].join('\n');

    let summary = '';
    try {
      const apiKey = Constants.expoConfig?.extra?.OPENAI_API_KEY || '';
      const requestBody = {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a construction project manager. Summarize the following selected site photos and notes into a professional construction report summary, highlighting key activities, issues, and progress.' },
          { role: 'user', content: allDescriptions }
        ],
        max_tokens: 200,
      };
      console.log('OpenAI API Key:', apiKey ? '[SET]' : '[NOT SET]');
      console.log('OpenAI Request Body:', JSON.stringify(requestBody));
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });
      console.log('OpenAI Response Status:', response.status);
      const data = await response.json();
      console.log('OpenAI Response JSON:', data);
      summary = data.choices?.[0]?.message?.content ?? 'Summary could not be generated.';
    } catch (err) {
      console.log('OpenAI Fetch Error:', err);
      summary = 'Summary could not be generated.';
    }
    Alert.alert('Report Summary', summary);
  };

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
            <View style={{ width: '100%', justifyContent: 'flex-start',   }}>
              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10, width: '90%', alignSelf: 'center',  borderRadius: 20, paddingBottom: 0 }}>
                {[
                  { icon: 'document-text', onPress: () => { setActiveTab('notes'); }, disabled: false, label: 'Notes' },
                  { icon: 'camera', onPress: () => { setActiveTab('photos'); }, disabled: uploading, isUploading: true, label: 'Photos' },
                  { icon: 'book', onPress: () => { setActiveTab('summaries'); }, disabled: false, label: 'Summaries' },
                ].map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={item.onPress}
                    disabled={item.disabled}
                    style={{
                      marginHorizontal: 6,
                      marginBottom: 10,
                      width: 90,
                      height: 30,
                      borderRadius: 1000,
                      borderWidth: 1,
                      borderColor: colors.primary,
                      shadowColor: '#000',
                      shadowOffset: { width: 10, height: 10 },
                      shadowRadius: 8,
                      elevation: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={
                        (item.icon === 'document-text' && activeTab === 'notes') ||
                        (item.icon === 'camera' && activeTab === 'photos') ||
                        (item.icon === 'book' && activeTab === 'summaries')
                          ? colors.secondary
                          : colors.primary
                      }
                    />
                    {/* <Text style={{ marginLeft: 8, color: (item.icon === 'document-text' && activeTab === 'notes') || (item.icon === 'camera' && activeTab === 'photos') || (item.icon === 'book' && activeTab === 'summaries') ? colors.secondary : colors.primary, fontWeight: 'bold' }}>{item.label}</Text> */}
                  </TouchableOpacity>
                ))}
              </View>
              

              {/* Tab Content */}
              {activeTab === 'photos' && (
                <ScrollView  contentContainerStyle={{ paddingBottom: 100 }}>
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
                              size={28}
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
                <ScrollView contentContainerStyle={{  paddingBottom: 100 }}>
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
                            {note.title}
                          </Text>
                          <CheckBox
                            checked={!!checkedNotes[note.id]}
                            onChange={(checked) =>
                              setCheckedNotes((prev) => ({ ...prev, [note.id]: checked }))
                            }
                            size={28}
                          />
                        </View>
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
              {activeTab === 'summaries' && (
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                  {summariesLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <Loader />
                    </View>
                  ) : summaries.length === 0 ? (
                    <Text style={{ alignSelf: 'center', marginTop: 0 }}>No summaries available.</Text>
                  ) : (
                    summaries.map((summary) => (
                      <View key={summary.id} style={{ marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: 12, padding: 16, width: 320, alignSelf: 'center', backgroundColor: '#fafafa' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#222', marginBottom: 8 }}>{summary.title}</Text>
                        <Text style={{ fontSize: 16, color: '#444' }}>{summary.summary}</Text>
                        <Text style={{ fontSize: 12, color: '#888', marginTop: 8 }}>{summary.created_at ? new Date(summary.created_at).toLocaleString() : ''}</Text>
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
                  paddingHorizontal: 28,
                  shadowColor: '#000',
                  shadowOffset: { width: 3, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: Object.values(checkedPhotos).some(Boolean) || Object.values(checkedNotes).some(Boolean) ? 1 : 0.5,
                }}
                onPress={handleGenerateReport}
                disabled={!(Object.values(checkedPhotos).some(Boolean) || Object.values(checkedNotes).some(Boolean))}
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
