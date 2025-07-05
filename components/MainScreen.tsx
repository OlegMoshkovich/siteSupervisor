import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import DropDown from './DropDown';
import DynamicDialog from './DynamicDialog';

// Define the tab param list
type TabParamList = {
  Main: undefined;
  Profile: undefined;
};

type PhotoWithUrl = {
  id: string;
  url: string;
  signedUrl: string | null;
};

export default function MainScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const [selectedProject, setSelectedProject] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(true);
  const { width } = Dimensions.get('window');
  const [selectedDate, setSelectedDate] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);

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
        const path = `${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photos')
          .upload(path, arraybuffer, {
            contentType: image.mimeType ?? 'image/jpeg',
          });

        if (uploadError) {
          Alert.alert('Upload failed', uploadError.message);
          setUploading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          Alert.alert('Upload failed', 'User not authenticated');
          setUploading(false);
          return;
        }

        const { error: insertError } = await supabase.from('photos').insert([
          {
            project_id: null,
            user_id: user.id,
            url: uploadData.path,
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
        console.error('Photo fetch error:', error.message);
        setPhotosLoading(false);
        return;
      }
      console.log('Photos data:', data);

      
      const signedPhotos = await Promise.all(
        (data || []).map(async (photo) => {
          const { data: signed, error: urlError } = await supabase.storage
            .from('photos')
            .createSignedUrl(photo.url, 300); // 5 min signed URL
      
          if (urlError) {
            console.error('Signed URL error:', urlError.message);
          }
      
          console.log('File path:', photo.url);
          console.log('Signed result:', signed);
      
          return {
            ...photo,
            signedUrl: signed?.signedUrl ?? null,
          };
        })
      );
      setPhotos(signedPhotos);
      setPhotosLoading(false);
    };

    fetchPhotos();
  }, [dialogVisible]);

  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: 'white', paddingTop: 80 }}>
      <View style={{ width: '86%', flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <DropDown
            items={['Project 1', 'Project 2', 'Project 3', 'Project 4']}
            selectedItem={selectedProject}
            setSelectedItem={setSelectedProject}
            placeholder="Select a project"
          />
        </View>
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#f9f9f9',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 12,
            borderWidth: 1,
            borderColor: '#009fe3',
          }}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person" size={24} color="grey" />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: 180,
          width: '86%',
        }}
      >
        {selectedProject &&
          [
            { icon: 'document-text', onPress: undefined, disabled: false },
            { icon: 'camera', onPress: handlePickAndUpload, disabled: uploading, isUploading: true },
            { icon: 'mic', onPress: undefined, disabled: false },
            { icon: 'search', onPress: () => setShowSearchBar(!showSearchBar), disabled: false },
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={item.onPress}
              disabled={item.disabled}
              style={{ margin: 6, opacity: item.disabled ? 0.5 : 1 }}
            >
              <View
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  borderWidth: 1,
                  borderColor: '#009fe3',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                }}
              >
                {item.icon === 'camera' && item.isUploading && uploading ? (
                  <ActivityIndicator size="large" color="#009fe3" />
                ) : (
                  <Ionicons name={item.icon as any} size={32} color="grey" />
                )}
              </View>
            </TouchableOpacity>
          ))}
      </View>

      {showSearchBar && selectedProject && (
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#009fe3',
              borderRadius: 40,
              paddingHorizontal: 16,
              backgroundColor: '#f5f5f5',
              width: '82%',
              marginBottom: 20,
            }}
          >
            <TextInput
              style={{ flex: 1, height: 42, paddingLeft: 8 }}
              placeholder="Search in a project..."
              placeholderTextColor="#888"
            />
            <TouchableOpacity>
              <Ionicons name="arrow-forward" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <DropDown
            items={['June 1', 'June 2', 'June 3', 'June 4']}
            selectedItem={selectedDate}
            placeholder="Select a date to access photos and notes"
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
          title: 'All uploaded photos',
          style: { paddingHorizontal: 16 },
          titleStyle: { color: '#009fe3' },
          headerAsButton: true,
          rightActionElement: 'Close',
          onRightAction: () => setDialogVisible(false),
          onHeaderPress: () => setDialogVisible(false),
          onBackAction: () => setDialogVisible(false),
        }}
        onClose={() => setDialogVisible(false)}
      >
        {photosLoading ? (
          <ActivityIndicator size="large" color="#009fe3" />
        ) : photos.length === 0 ? (
          <Text>No photos available.</Text>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16 }}>
 {photos.map((photo) =>
  photo.signedUrl ? (
    <Image
      key={photo.id}
      source={{ uri: photo.signedUrl }}
      style={{
        width: 100,
        height: 100,
        marginBottom: 10,
        borderRadius: 8,
        alignSelf: 'center',
      }}
    />
  ) : null
)}
          </ScrollView>
        )}
      </DynamicDialog>

      <View style={{ position: 'absolute', bottom: 24, left: 0, width: '100%', alignItems: 'center' }} pointerEvents="none">
        <Image
          source={require('../assets/cloneit.png')}
          style={{ width: width * 0.8, height: 50, resizeMode: 'contain' }}
        />
      </View>
    </View>
  );
}
