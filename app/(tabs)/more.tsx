import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { useIsAdmin } from '../../hooks/useAdmin'

type IconName = keyof typeof Ionicons.glyphMap

type MoreItem = { title: string; subtitle: string; icon: IconName; route: '/(tabs)/stats' | '/(tabs)/profile' | '/admin' }

const baseItems: MoreItem[] = [
  { title: 'STATISTICHE', subtitle: 'Progressi, frequenza e volume', icon: 'bar-chart', route: '/(tabs)/stats' },
  { title: 'PROFILO', subtitle: 'Account e target nutrition', icon: 'person', route: '/(tabs)/profile' },
]

export default function MoreScreen() {
  const router = useRouter()
  const { data: isAdmin } = useIsAdmin()
  const items = isAdmin
    ? [...baseItems, { title: 'ADMIN', subtitle: 'Gestione esercizi e dati base', icon: 'settings' as IconName, route: '/admin' as const }]
    : baseItems

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.ornamentRow}>
          <View style={styles.line} /><Text style={styles.ornamentChar}>✦</Text><View style={styles.line} />
        </View>
        <Text style={styles.title}>ALTRO</Text>

        <View style={styles.list}>
          {items.map(item => (
            <TouchableOpacity key={item.title} style={styles.row} onPress={() => router.push(item.route)}>
              <View style={styles.iconBox}>
                <Ionicons name={item.icon} size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowSub}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: 24, gap: 18 },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  ornamentChar: { color: colors.accent, fontSize: 12 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: 8, marginBottom: 4 },
  list: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  iconBox: { width: 40, height: 40, borderWidth: 1, borderColor: colors.accent, backgroundColor: colors.accentDim, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { color: colors.text, fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  rowSub: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
})
