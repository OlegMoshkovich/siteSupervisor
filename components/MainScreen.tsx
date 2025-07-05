import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Pressable, FlatList, Dimensions, Alert, ActivityIndicator, Image } from 'react-native';
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

export default function MainScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const [selectedProject, setSelectedProject] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(true);
  const { width, height } = Dimensions.get('window');
  const [selectedDate, setSelectedDate] = useState('');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  
  const handlePickAndUpload = async () => {
    console.log('Starting handlePickAndUpload');
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('Media library permission status:', status);
    if (status !== 'granted') {
      Alert.alert('Permission required to access photo library!');
      return;
    }

    // Pick an image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    console.log('Image picker result:', result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const image = result.assets[0];
      try {
        setUploading(true);
        console.log('Uploading image:', image.uri);
        // Upload to Supabase Storage
        const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());
        console.log('Fetched arraybuffer, size:', arraybuffer.byteLength);
        const fileExt = image.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
        const path = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photos')
          .upload(path, arraybuffer, {
            contentType: image.mimeType ?? 'image/jpeg',
          });
        console.log('Supabase upload result:', uploadData, uploadError);

        if (uploadError) {
          console.log('Upload error:', uploadError);
          Alert.alert('Upload failed', uploadError.message);
          setUploading(false);
          return;
        }

        // Get the authenticated user id
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          Alert.alert('Upload failed', 'User not authenticated');
          setUploading(false);
          return;
        }

        // Insert into photos table
        const { error: insertError } = await supabase
          .from('photos')
          .insert([
            {
              project_id: null, // or a real project_id if you have one
              user_id: user.id,    // set to the current user's id
              url: uploadData.path,
              metadata: { note: 'Test upload from library' }
            }
          ]);
        console.log('Supabase DB insert result:', insertError);

        if (insertError) {
          Alert.alert('DB insert failed', insertError.message);
        } else {
          Alert.alert('Photo uploaded and record created!');
        }
      } catch (err: any) {
        console.log('Catch error:', err);
        Alert.alert('Upload failed', err.message || 'Unknown error');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', backgroundColor: 'white', paddingTop: 80 }}>
      <View style={{ width: '86%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
          activeOpacity={0.7}
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
          alignItems: 'center',
          marginVertical: 50,
          width: '86%',
          marginTop: 180,
        }}
      >
        {selectedProject ? (
          [
            { icon: 'document-text', onPress: undefined, disabled: false, color: 'grey' },
            { icon: 'camera', onPress: handlePickAndUpload, disabled: uploading, color: 'grey', isUploading: true },
            { icon: 'mic', onPress: undefined, disabled: false, color: 'grey' },
            { icon: 'search', onPress: () => setShowSearchBar(!showSearchBar), disabled: false, color: !showSearchBar ? 'grey' : 'darkGrey' },
            // Add more items here if you want to fill out the 4x4 grid (16 items)
          ].concat(Array(0).fill({ icon: null })).map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={item.onPress}
              disabled={item.disabled}
              style={{
                margin: 6,
                opacity: item.disabled ? 0.5 : 1,
              }}
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
                ) : item.icon ? (
                  <Ionicons name={item.icon} size={32} color={item.color} />
                ) : null}
              </View>
            </TouchableOpacity>
          ))
        ) : null}
      </View>
      {showSearchBar && selectedProject  && ( 
        <View>
        <View
          style={{

            zIndex: 10,
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
            style={{
              flex: 1,
              height: 42,
              borderRadius: 40,
              paddingLeft: 8,
              backgroundColor: 'transparent',
            }}
            placeholder="Search in a project..."
            placeholderTextColor="#888"
          />
          <TouchableOpacity >
            <Ionicons name="arrow-forward" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <DropDown
        items={['June 1', 'June 2', 'June 3', 'June 4',]}
        selectedItem={selectedDate}
        placeholder="Select a date to access photos and notes"
          setSelectedItem={(date) => {
              setSelectedDate(date);
            setShowDateDropdown(false);
            if (date) setDialogVisible(true);
          }}
        />
        </View>
      )}
      <DynamicDialog
        visible={dialogVisible}
        headerProps={{
          title: 'Selected date: ' + selectedDate,
          style: {
            paddingHorizontal: 16,
          },
          titleStyle: {
            color: '#009fe3',
          },
          headerAsButton: true,
          rightActionElement: 'Close',
          onRightAction: () => {
            setDialogVisible(false);
            setSelectedDate('');
          },
          onHeaderPress: () => {
            setDialogVisible(false);
            setSelectedDate('');
          },
          onBackAction: () => {
            setDialogVisible(false);
            setSelectedDate('');
          },
        }}
        onClose={() => {
          setDialogVisible(false);
          setSelectedDate('');
        }}
      >
        <Text>photos and notes</Text>
      </DynamicDialog>
      {/* PNG logo at the bottom */}
      <View style={{ position: 'absolute', bottom: 24, left: 0, width: '100%', alignItems: 'center', zIndex: 1 }} pointerEvents="none">
        <Image
          source={require('../assets/cloneit.png')}
          style={{ width: width * 0.8, height: 50, resizeMode: 'contain' }}
        />
      </View>
    </View>
  );
} 