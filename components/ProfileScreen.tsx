import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Dimensions } from 'react-native';
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
  navigation: StackNavigationProp<RootStackParamList, 'Profile'>;
  route: any;
  session: Session;
}

export default function ProfileScreen({ navigation, session }: ProfileScreenProps) {
  console.log('ProfileScreen rendered', { session });
  const { width } = Dimensions.get('window');
  return (
    <View style={{ backgroundColor: 'white', height: '100%' }}>
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
          borderColor: '#009fe3',
        }}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Tabs')}
      >
        <Ionicons name="arrow-back" size={24} color="grey" />
      </TouchableOpacity>
      <Account session={session} />
    </View>
  );
} 