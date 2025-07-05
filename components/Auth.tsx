import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, TouchableOpacity, Text, Image, Dimensions } from 'react-native'
import { supabase } from '../lib/supabase'
import { Input } from '@rneui/themed'
import colors from './colors'

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { width } = Dimensions.get('window');
  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="Email"
          autoCapitalize={'none'}
          labelStyle={{ color: colors.primary, fontSize: 16, fontWeight: 400, display: 'none' }}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
          labelStyle={{ color: colors.primary, fontSize: 16, fontWeight: 400, display: 'none' }}
          style={{  borderColor: colors.primary, borderRadius: 30, paddingVertical: 12, backgroundColor: 'white' }}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TouchableOpacity
          style={styles.customButton}
          disabled={loading}
          onPress={signInWithEmail}
        >
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.verticallySpaced}>
        <TouchableOpacity
          style={[styles.customButton, { borderWidth: .5, borderColor: colors.primary, backgroundColor: 'black ' }]}
          disabled={loading}
          onPress={signUpWithEmail}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>Sign up</Text>
        </TouchableOpacity>
      </View>
      <View style={{ position: 'absolute', bottom: -300, left: 0, width: '100%', alignItems: 'center', zIndex: 1 }} pointerEvents="none">
        <Image
          source={require('../assets/cloneit.png')}
          style={{ width: width * 0.8, height: 50, resizeMode: 'contain' }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 50,
  },
  customButton: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})