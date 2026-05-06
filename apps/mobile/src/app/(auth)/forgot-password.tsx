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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReset() {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      Alert.alert('Required', 'Please enter your email address.')
      return
    }
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/callback`,
    })
    setLoading(false)
    // Always show success to prevent email enumeration
    Alert.alert(
      'Check your email',
      'If an account exists for that email, a password reset link has been sent.',
      [{ text: 'Back to sign in', onPress: () => router.replace('/(auth)/login') }]
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
          <View className="mb-10">
            <Text className="text-2xl font-bold text-text" style={{ fontFamily: 'Nunito_700Bold' }}>
              Reset password
            </Text>
            <Text className="text-text-muted mt-2">
              Enter your email and we'll send you a reset link.
            </Text>
          </View>

          <View>
            <Text className="text-sm font-medium text-text mb-1.5">Email address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleReset}
              accessibilityLabel="Email address"
              className="w-full bg-white rounded-xl border border-border px-4 py-3 text-text text-sm"
              placeholderTextColor="#9CA3AF"
              placeholder="you@example.com"
            />
          </View>

          <TouchableOpacity
            onPress={handleReset}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Send reset link"
            className="w-full py-3.5 rounded-xl bg-primary-500 items-center mt-5"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base" style={{ fontFamily: 'Nunito_700Bold' }}>
                Send reset link
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            className="items-center mt-5"
          >
            <Text className="text-primary-500 text-sm">← Back to sign in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
