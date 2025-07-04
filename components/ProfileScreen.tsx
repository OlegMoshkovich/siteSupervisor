import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Account from './Account';
import { Session } from '@supabase/supabase-js';

// Define the stack param list
type RootStackParamList = {
  Tabs: undefined;
  Profile: undefined;
};

interface ProfileScreenProps {
  session: Session;
}

export default function ProfileScreen({ session }: ProfileScreenProps) {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View>
      <TouchableOpacity
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#f9f9f9',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 20,
          marginTop: 80,
          borderWidth: 1,
          borderColor: '#007bff',
        }}
        activeOpacity={0.7}       
        onPress={() => navigation.navigate('Tabs' as never)}
      >
        <Ionicons name="arrow-back" size={24} color="grey" />
      </TouchableOpacity>
      <Account session={session} />
    </View>
  );
} 