import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainScreen from '../components/MainScreen';
import ProfileScreen from '../components/ProfileScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Session } from '@supabase/supabase-js';

const Tab = createBottomTabNavigator();

export default function TabNavigator({ session }: { session: Session }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (route.name === 'Main') iconName = 'home';
          if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Main">
        {props => <MainScreen {...props} session={session} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {props => <ProfileScreen {...props} session={session} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
} 