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

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })
    setLoading(false)

    if (error) {
      // Generic error to avoid user enumeration
      Alert.alert('Sign In Failed', 'Invalid email or password. Please try again.')
    }
    // Navigation handled by _layout.tsx onAuthStateChange
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
          {/* Logo */}
          <View className="items-center mb-10">
            <SpectrumLogo size={80} />
            <Text className="text-2xl font-bold text-text mt-4" style={{ fontFamily: 'Nunito_700Bold' }}>
              Welcome back
            </Text>
            <Text className="text-text-muted mt-1 text-center">
              Sign in to your Spectrum Circle account
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
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
                autoComplete="current-password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                accessibilityLabel="Password"
                className="w-full bg-white rounded-xl border border-border px-4 py-3 text-text text-sm"
                placeholderTextColor="#9CA3AF"
                placeholder="••••••••"
              />
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              className="w-full py-3.5 rounded-xl bg-primary-500 items-center mt-2"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base" style={{ fontFamily: 'Nunito_700Bold' }}>
                  Sign in
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              accessibilityRole="button"
              className="items-center py-2"
            >
              <Text className="text-primary-500 text-sm">Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Register link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-text-muted text-sm">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')} accessibilityRole="link">
              <Text className="text-primary-500 text-sm font-semibold">Create one free</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
