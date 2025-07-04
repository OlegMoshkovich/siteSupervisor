import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Pressable, FlatList, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function MainScreen() {
  const [selectedProject, setSelectedProject] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const projects = ['Project 1', 'Project 2', 'Project 3', 'Project 4'];
  const { width, height } = Dimensions.get('window');

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 30, backgroundColor: 'white', paddingTop: 40 }}>
      <View style={{ width: 300, marginTop:20 }}>
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
            paddingVertical: 4,
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
                      padding: 12,
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
      <TouchableOpacity >
        <View
          style={{
            width: 150,
            height: 150,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: '#007bff',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="document-text" size={60} color="grey" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity >
        <View
          style={{
            width: 150,
            height: 150,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: '#007bff',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="camera" size={60} color="darkGrey" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity >
        <View
          style={{
            width: 150,
            height: 150,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: '#007bff',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="mic" size={60} color="grey" />
        </View>
      </TouchableOpacity>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#007bff',
          borderRadius: 40,
          paddingHorizontal: 16,
          backgroundColor: '#f5f5f5',
          width: 300,
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
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
} 