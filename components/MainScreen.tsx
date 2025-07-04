import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Pressable, FlatList, Dimensions, Alert, ActivityIndicator, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

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
  const [showSearchBar, setShowSearchBar] = useState(false);
  const projects = ['Project 1', 'Project 2', 'Project 3', 'Project 4'];
  const { width, height } = Dimensions.get('window');

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

        // Insert into photos table
        const { error: insertError } = await supabase
          .from('photos')
          .insert([
            {
              project_id: null, // or a real project_id if you have one
              user_id: null,    // or the current user's id
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
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowDropdown(true)}
          >
            <View style={{
              borderWidth: 1,
              borderColor: '#007bff',
              borderRadius: 120,
              backgroundColor: '#f9f9f9',
              paddingHorizontal: 12,
            }}>
              <Text style={{ height: 40, lineHeight: 40, color: selectedProject ? '#222' : '#888' }}>
                {selectedProject || 'Choose a project...'}
              </Text>
            </View>
          </TouchableOpacity>
          {showDropdown && (
            <>
              <Pressable
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width,
                  height,
                  zIndex: 9,
                }}
                onPress={() => setShowDropdown(false)}
              />
              <View style={{
                position: 'absolute',
                top: 60,
                left: 0,
                width: '100%',
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#007bff',
                borderRadius: 8,
                zIndex: 10,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}>
                <FlatList
                  data={projects}
                  keyExtractor={(item) => item}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedProject(item);
                        setShowDropdown(false);
                      }}
                      style={{
                        padding: 10,
                        borderBottomWidth: index < projects.length - 1 ? 1 : 0,
                        borderBottomColor: '#eee',
                      }}
                    >
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </>
          )}
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
            borderColor: '#007bff',
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
          marginVertical: 16,
          width: '86%',
          marginTop: 200,
        }}
      >
        {[
          { icon: 'document-text', onPress: undefined, disabled: false, color: 'grey' },
          { icon: 'camera', onPress: handlePickAndUpload, disabled: uploading, color: 'darkGrey', isUploading: true },
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
                borderColor: '#007bff',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
              }}
            >
              {item.icon === 'camera' && item.isUploading && uploading ? (
                <ActivityIndicator size="large" color="#007bff" />
              ) : item.icon ? (
                <Ionicons name={item.icon} size={32} color={item.color} />
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      {showSearchBar && (
        <View
          style={{
            // position: 'absolute',
            // bottom: 100,
            zIndex: 10,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#007bff',
            borderRadius: 40,
            paddingHorizontal: 16,
            backgroundColor: '#f5f5f5',
            width: '82%',
            height: 48,
          }}
        >
          <TextInput
            style={{
              flex: 1,
              height: 40,
              borderRadius: 40,
              paddingLeft: 8,
              backgroundColor: 'transparent',
            }}
            placeholder="Search..."
            placeholderTextColor="#888"
          />
          <TouchableOpacity >
            <Ionicons name="arrow-forward" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      )}
      {/* PNG logo at the bottom */}
      <View style={{ position: 'absolute', bottom: 40, left: 0, width: '100%', alignItems: 'center', zIndex: 1 }} pointerEvents="none">
        <Image
          source={require('../assets/cloneit.png')}
          style={{ width: width * 0.8, height: 50, resizeMode: 'contain' }}
        />
      </View>
    </View>
  );
} 