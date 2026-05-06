import { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MapPin } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { USER_ROLE_LABELS, USER_ROLE_COLORS, getInitials } from '@spectrumcircle/shared'
import type { Profile, UserRole } from '@spectrumcircle/shared'

const ROLE_FILTERS: Array<{ value: UserRole | ''; label: string }> = [
  { value: '', label: 'Everyone' },
  { value: 'parent', label: 'Parents' },
  { value: 'volunteer', label: 'Volunteers' },
  { value: 'job_seeker', label: 'Job Seekers' },
  { value: 'employer', label: 'Employers' },
  { value: 'entrepreneur', label: 'Entrepreneurs' },
]

export default function ConnectScreen() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfiles() {
      setLoading(true)
      let query = supabase
        .from('profiles')
        .select('id, display_name, bio, location, avatar_url, role')
        .in('privacy_level', ['public', 'members_only'])
        .order('created_at', { ascending: false })
        .limit(30)

      if (selectedRole) query = query.eq('role', selectedRole)

      const { data } = await query
      setProfiles((data as Profile[]) ?? [])
      setLoading(false)
    }
    fetchProfiles()
  }, [selectedRole])

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-text" style={{ fontFamily: 'Nunito_700Bold' }}>
          Connect
        </Text>
        <Text className="text-text-muted text-sm mt-1">
          Find parents, volunteers, and professionals
        </Text>
      </View>

      {/* Role filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-2"
        contentContainerStyle={{ gap: 8 }}
        accessibilityLabel="Filter by role"
      >
        {ROLE_FILTERS.map(({ value, label }) => {
          const isActive = selectedRole === value
          const color = value ? USER_ROLE_COLORS[value] : '#5B4FCF'
          return (
            <TouchableOpacity
              key={value}
              onPress={() => setSelectedRole(value)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 50,
                borderWidth: 1,
                backgroundColor: isActive ? color : '#FFFFFF',
                borderColor: isActive ? color : '#E5E7EB',
              }}
            >
              <Text style={{ color: isActive ? '#FFFFFF' : '#6B7280', fontSize: 13, fontWeight: '600' }}>
                {label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#5B4FCF" />
        </View>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          numColumns={1}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => {
            const role = item.role as UserRole
            const roleColor = USER_ROLE_COLORS[role]
            const roleLabel = USER_ROLE_LABELS[role]
            return (
              <TouchableOpacity
                className="bg-white rounded-2xl border border-border p-4 flex-row gap-3"
                accessibilityRole="button"
                accessibilityLabel={`View ${item.display_name}'s profile`}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: roleColor }}
                  accessibilityLabel={`${item.display_name} avatar`}
                >
                  <Text className="text-white font-bold text-base">
                    {getInitials(item.display_name)}
                  </Text>
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="font-bold text-text" style={{ fontFamily: 'Nunito_700Bold' }}>
                    {item.display_name}
                  </Text>
                  <View
                    style={{
                      backgroundColor: `${roleColor}20`,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 50,
                      alignSelf: 'flex-start',
                      marginTop: 2,
                    }}
                  >
                    <Text style={{ color: roleColor, fontSize: 11, fontWeight: '600' }}>
                      {roleLabel}
                    </Text>
                  </View>
                  {item.bio && (
                    <Text className="text-text-muted text-sm mt-1" numberOfLines={2}>
                      {item.bio}
                    </Text>
                  )}
                  {item.location && (
                    <View className="flex-row items-center gap-1 mt-1">
                      <MapPin size={11} color="#9CA3AF" />
                      <Text className="text-text-light text-xs">{item.location}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )
          }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-text-muted text-center">No community members found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}
