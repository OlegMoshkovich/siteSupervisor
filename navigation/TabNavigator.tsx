import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainScreen from '../components/MainScreen';
import ProfileScreen from '../components/ProfileScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Session } from '@supabase/supabase-js';
      
const Tab = createBottomTabNavigator();

export default function TabNavigator({ session }: { session: Session }) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string = '';

            if (route.name === 'Main') {
              iconName = focused ? 'camera' : 'camera-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            if (!iconName) iconName = 'ellipse-outline';

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007bff',
          tabBarInactiveTintColor: 'gray',
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIconStyle: { marginTop: 14 },
        })}
      >
        <Tab.Screen name="Main" component={MainScreen} />
        <Tab.Screen name="Profile" >
          {props => <ProfileScreen {...props} session={session} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
} 