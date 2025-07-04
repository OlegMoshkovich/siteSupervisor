import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import TabNavigator from './navigation/TabNavigator';
import ProfileScreen from './components/ProfileScreen';
import { Session } from '@supabase/supabase-js';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (!session) {
    return <Auth />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" >
          {props => <TabNavigator {...props} session={session} />}
        </Stack.Screen>
        <Stack.Screen name="Profile">
          {props => <ProfileScreen {...props} session={session} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}