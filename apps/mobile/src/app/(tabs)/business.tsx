import { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TrendingUp, Globe } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { OPPORTUNITY_TYPE_LABELS, formatRelativeTime } from '@spectrumcircle/shared'
import type { BusinessOpportunity, OpportunityType } from '@spectrumcircle/shared'

const TYPE_COLORS: Record<OpportunityType, string> = {
  partnership: '#4BADE8',
  investment: '#4CAF7D',
  mentorship: '#9B59B6',
  project: '#FF9A3C',
  other: '#6B7280',
}

export default function BusinessScreen() {
  const [opportunities, setOpportunities] = useState<BusinessOpportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOpps() {
      const { data } = await supabase
        .from('business_opportunities')
        .select('id, title, description, company_name, opportunity_type, location, is_remote, tags, created_at, owner_id')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(30)
      setOpportunities((data as BusinessOpportunity[]) ?? [])
      setLoading(false)
    }
    fetchOpps()
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-text" style={{ fontFamily: 'Nunito_700Bold' }}>
          Business
        </Text>
        <Text className="text-text-muted text-sm mt-1">
          Opportunities connecting autistic entrepreneurs with collaborators
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#5B4FCF" />
        </View>
      ) : (
        <FlatList
          data={opportunities}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => {
            const type = item.opportunity_type as OpportunityType
            const typeColor = TYPE_COLORS[type] ?? '#5B4FCF'
            return (
              <TouchableOpacity
                className="bg-white rounded-2xl border border-border p-4"
                accessibilityRole="button"
                accessibilityLabel={`View opportunity: ${item.title}`}
              >
                <View className="flex-row items-start justify-between gap-2 mb-2">
                  <View
                    style={{
                      backgroundColor: typeColor,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      borderRadius: 50,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                      {OPPORTUNITY_TYPE_LABELS[type]}
                    </Text>
                  </View>
                  {item.is_remote && (
                    <View className="flex-row items-center gap-1">
                      <Globe size={12} color="#16A34A" />
                      <Text style={{ color: '#16A34A', fontSize: 11 }}>Remote</Text>
                    </View>
                  )}
                </View>

                <Text className="font-bold text-text" style={{ fontFamily: 'Nunito_700Bold' }}>
                  {item.title}
                </Text>
                {item.company_name && (
                  <Text className="text-text-muted text-sm mt-0.5">{item.company_name}</Text>
                )}
                <Text className="text-text-muted text-sm mt-2 leading-relaxed" numberOfLines={2}>
                  {item.description}
                </Text>

                {item.tags?.length > 0 && (
                  <View className="flex-row flex-wrap gap-1.5 mt-2">
                    {item.tags.slice(0, 3).map((tag) => (
                      <View
                        key={tag}
                        style={{
                          backgroundColor: '#F3F4F6',
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ color: '#6B7280', fontSize: 11 }}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <Text className="text-text-light text-xs mt-2">
                  {formatRelativeTime(item.created_at)}
                </Text>
              </TouchableOpacity>
            )
          }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-text-muted text-center">No opportunities posted yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}
