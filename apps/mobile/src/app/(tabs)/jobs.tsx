import { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Briefcase, MapPin } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { JOB_TYPE_LABELS, formatRelativeTime } from '@spectrumcircle/shared'
import type { JobPosting, JobType } from '@spectrumcircle/shared'

export default function JobsScreen() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJobs() {
      const { data } = await supabase
        .from('job_postings')
        .select('id, title, company_name, location, is_remote, job_type, autism_accommodations, required_skills, created_at, employer_id')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(30)
      setJobs((data as JobPosting[]) ?? [])
      setLoading(false)
    }
    fetchJobs()
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-text" style={{ fontFamily: 'Nunito_700Bold' }}>
          Jobs Board
        </Text>
        <Text className="text-text-muted text-sm mt-1">
          Autism-friendly opportunities from inclusive employers
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#5B4FCF" />
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white rounded-2xl border border-border p-4"
              accessibilityRole="button"
              accessibilityLabel={`View job: ${item.title} at ${item.company_name}`}
            >
              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 rounded-xl bg-yellow-50 items-center justify-center">
                  <Briefcase size={18} color="#B45309" />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="font-bold text-text" style={{ fontFamily: 'Nunito_700Bold' }}>
                    {item.title}
                  </Text>
                  <Text className="text-text-muted text-sm mt-0.5">{item.company_name}</Text>
                  <View className="flex-row items-center gap-3 mt-2 flex-wrap">
                    <View className="flex-row items-center gap-1">
                      <MapPin size={11} color="#9CA3AF" />
                      <Text className="text-text-muted text-xs">
                        {item.is_remote ? 'Remote' : (item.location ?? 'On-site')}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: '#FEF9C3',
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 50,
                      }}
                    >
                      <Text style={{ color: '#A16207', fontSize: 11, fontWeight: '600' }}>
                        {JOB_TYPE_LABELS[item.job_type as JobType]}
                      </Text>
                    </View>
                    {item.autism_accommodations && (
                      <View
                        style={{
                          backgroundColor: '#EFF6FF',
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 50,
                        }}
                      >
                        <Text style={{ color: '#1D4ED8', fontSize: 11, fontWeight: '600' }}>
                          Accommodations
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text className="text-text-light text-xs flex-shrink-0">
                  {formatRelativeTime(item.created_at)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-text-muted text-center">No open jobs at the moment.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}
