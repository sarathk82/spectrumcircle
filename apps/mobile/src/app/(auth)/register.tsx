import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import SpectrumLogo from '@/components/SpectrumLogo'

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    const trimmedName = displayName.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedName || !trimmedEmail || !password) {
      Alert.alert('Missing fields', 'Please fill in all required fields.')
      return
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: { display_name: trimmedName },
      },
    })
    setLoading(false)

    if (error) {
      if (error.message.includes('already registered')) {
        Alert.alert('Email taken', 'An account with this email already exists.')
      } else {
        Alert.alert('Registration failed', 'Please try again.')
      }
      return
    }

    Alert.alert(
      'Account created!',
      'Check your email to verify your address, then sign in.',
      [{ text: 'Sign in', onPress: () => router.replace('/(auth)/login') }]
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          className="px-6"
        >
          <View className="items-center mb-10">
            <SpectrumLogo size={72} />
            <Text className="text-2xl font-bold text-text mt-4" style={{ fontFamily: 'Nunito_700Bold' }}>
              Join Spectrum Circle
            </Text>
            <Text className="text-text-muted mt-1 text-center text-sm">
              Create your free account today
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-text mb-1.5">Display name</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={50}
                returnKeyType="next"
                accessibilityLabel="Display name"
                className="w-full bg-white rounded-xl border border-border px-4 py-3 text-text text-sm"
                placeholderTextColor="#9CA3AF"
                placeholder="How should we call you?"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-text mb-1.5">Email address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                accessibilityLabel="Email address"
                className="w-full bg-white rounded-xl border border-border px-4 py-3 text-text text-sm"
                placeholderTextColor="#9CA3AF"
                placeholder="you@example.com"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-text mb-1.5">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                accessibilityLabel="Password"
                className="w-full bg-white rounded-xl border border-border px-4 py-3 text-text text-sm"
                placeholderTextColor="#9CA3AF"
                placeholder="At least 8 characters"
              />
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Create account"
              className="w-full py-3.5 rounded-xl bg-primary-500 items-center mt-2"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base" style={{ fontFamily: 'Nunito_700Bold' }}>
                  Create free account
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-8">
            <Text className="text-text-muted text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')} accessibilityRole="link">
              <Text className="text-primary-500 text-sm font-semibold">Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
