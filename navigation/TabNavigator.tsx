import React from 'react';
import MainScreen from '../components/MainScreen';
import { Session } from '@supabase/supabase-js';

export default function TabNavigator({ session }: { session: Session }) {
  return <MainScreen />;
} 