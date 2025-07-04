import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function MainScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 40, backgroundColor: 'white' }}>
      <TouchableOpacity >
        <View
          style={{
            width: 150,
            height: 150,
            borderRadius: 100,
            backgroundColor: '#e0e0e0',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="document-text" size={60} color="#333" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity >
        <View
          style={{
            width: 150,
            height: 150,
            borderRadius: 100,
            backgroundColor: '#e0e0e0',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="camera" size={60} color="#333" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity >
        <View
          style={{
            width: 150,
            height: 150,
            borderRadius: 100,
            backgroundColor: '#e0e0e0',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="mic" size={60} color="#333" />
        </View>
      </TouchableOpacity>
    </View>
  );
} 