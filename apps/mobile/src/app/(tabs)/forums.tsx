import { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MessageCircle, ArrowRight } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import type { ForumCategory } from '@spectrumcircle/shared'

export default function ForumsScreen() {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('forum_categories')
        .select('id, name, slug, description, color, post_count')
        .order('sort_order', { ascending: true })
      setCategories((data as ForumCategory[]) ?? [])
      setLoading(false)
    }
    fetchCategories()
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-text" style={{ fontFamily: 'Nunito_700Bold' }}>
          Forums
        </Text>
        <Text className="text-text-muted text-sm mt-1">
          Community discussions for every topic
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#5B4FCF" />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white rounded-2xl border border-border p-4 flex-row items-center gap-4"
              accessibilityRole="button"
              accessibilityLabel={`Open forum: ${item.name}`}
            >
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${item.color}18` }}
              >
                <MessageCircle size={22} color={item.color} />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="font-bold text-text" style={{ fontFamily: 'Nunito_700Bold' }}>
                  {item.name}
                </Text>
                <Text className="text-text-muted text-sm mt-0.5 leading-relaxed" numberOfLines={2}>
                  {item.description}
                </Text>
                <Text className="text-text-light text-xs mt-1">
                  {item.post_count} {item.post_count === 1 ? 'post' : 'posts'}
                </Text>
              </View>
              <ArrowRight size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-text-muted">No forums available.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}
