import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://uqzexvdkknzepctpxrfm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxemV4dmRra256ZXBjdHB4cmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MzAxMTQsImV4cCI6MjA2NzIwNjExNH0.25SPY4GvP9SeUXN-OQmtlZeZGUArChhmr3EFKx6ImdA'
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})