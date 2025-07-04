import React from 'react';
import { View, Text } from 'react-native';
import Account from './Account';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

export default function ProfileScreen() {
  // You may want to get the session from context or props in a real app
  // For now, just render a placeholder
  // Replace this with your actual session logic
  const [session, setSession] = React.useState<Session | null>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  if (!session) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: 'white', height: '100%' }}>
      <Account session={session} />
    </View>
  );
} 