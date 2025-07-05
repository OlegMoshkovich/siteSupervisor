import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainScreen from '../components/MainScreen';
import ProfileScreen from '../components/ProfileScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Session } from '@supabase/supabase-js';
import RetrieveScreen from '../components/Retrieve';

const Tab = createBottomTabNavigator();

export default function TabNavigator({ session }: { session: Session }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#d42a02',
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (route.name === 'Add') iconName = 'add-circle';
          if (route.name === 'Profile') iconName = 'person';
          if (route.name === 'Retrieve') iconName = 'search';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Add">
        {props => <MainScreen {...props} session={session} />}
      </Tab.Screen>
      <Tab.Screen name="Retrieve">
        {props => <RetrieveScreen {...props} session={session} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {props => <ProfileScreen {...props} session={session} />}
      </Tab.Screen>
     
    </Tab.Navigator>
  );
} 