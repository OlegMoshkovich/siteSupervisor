import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert, TouchableOpacity, Text, ActivityIndicator } from 'react-native'
import { Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import Avatar from './Avatar'
import colors from './colors'

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string
    website: string
    avatar_url: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    setSigningOut(false)
  }

  return (
    <View style={styles.container}>
      <View>
        <Avatar
          size={100}
          url={avatarUrl}
          onUpload={(url: string) => {
            setAvatarUrl(url)
            updateProfile({ username, website, avatar_url: url })
          }}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input 
         labelStyle={{ color: 'colors.primary', fontSize: 16, fontWeight: 400, }}
        label="Email" value={session?.user?.email} disabled />
      </View>
      <View style={styles.verticallySpaced}>
        <Input 
        labelStyle={{ color: 'colors.primary', fontSize: 16, fontWeight: 400, }}
        label="Name" value={username || ''} onChangeText={(text) => setUsername(text)} />
      </View>
      <View style={styles.verticallySpaced}>
        <Input 
             labelStyle={{ color: 'colors.primary', fontSize: 16, fontWeight: 400, }}
        label="Company" value={website || ''} onChangeText={(text) => setWebsite(text)} />
      </View>

      {/* <View style={[styles.verticallySpaced, styles.mt20]}>
        <TouchableOpacity
          style={[styles.customButton, loading && styles.disabledButton, { borderWidth: .5, borderColor: colors.primary }]}
          onPress={() => updateProfile({ username, website, avatar_url: avatarUrl })}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Loading ...' : 'Update'}</Text>
        </TouchableOpacity>
      </View> */}

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TouchableOpacity
          style={[styles.customButton, { borderWidth: .5, borderColor: colors.primary }]}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Out</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    paddingTop: 40,
    padding: 12,
    backgroundColor: 'white'
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
    backgroundColor: 'white'
  },
  mt20: {
    marginTop: 20,
    backgroundColor: 'white'
  },
  customButton: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'black',
    // fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#b0b0b0',
  },
})