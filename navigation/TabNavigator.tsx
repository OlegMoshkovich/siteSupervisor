import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainScreen from '../components/MainScreen';
import ProfileScreen from '../components/ProfileScreen';
import ProjectScreen from '../components/ProjectScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Session } from '@supabase/supabase-js';
import RetrieveScreen from '../components/Retrieve';
import colors from '../components/colors';

const Tab = createBottomTabNavigator();

export default function TabNavigator({ session }: { session: Session }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.secondary,
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (route.name === 'Add') iconName = 'add-circle';
          if (route.name === 'Profile') iconName = 'person';
          if (route.name === 'Projects') iconName = 'settings-outline';
          if (route.name === 'Retrieve') iconName = 'search';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          borderTopWidth: 0, // Remove the top border
          elevation: 0,      // Remove shadow on Android
          shadowOpacity: 0,  // Remove shadow on iOS
        },
      })}
    >
      <Tab.Screen name="Add">
        {props => <MainScreen {...props} session={session} />}
      </Tab.Screen>
      <Tab.Screen name="Retrieve">
        {props => <RetrieveScreen {...props} session={session} />}
      </Tab.Screen>
      <Tab.Screen name="Projects">
        {() => <ProjectScreen />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {props => <ProfileScreen {...props} session={session} />}
      </Tab.Screen>

     
    </Tab.Navigator>
  );
} 