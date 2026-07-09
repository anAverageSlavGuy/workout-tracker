import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../constants/colors'

type IconName = keyof typeof Ionicons.glyphMap

function icon(name: IconName, focused: boolean) {
  const outlineName = (String(name) + '-outline') as IconName
  return <Ionicons name={focused ? name : outlineName} size={24} color={focused ? colors.accent : colors.textMuted} />
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1 },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ focused }) => icon('home', focused) }} />
      <Tabs.Screen name="templates" options={{ title: 'Template', tabBarIcon: ({ focused }) => icon('list', focused) }} />
      <Tabs.Screen name="history" options={{ title: 'Storico', tabBarIcon: ({ focused }) => icon('time', focused) }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats', tabBarIcon: ({ focused }) => icon('bar-chart', focused) }} />
      <Tabs.Screen name="profile" options={{ title: 'Profilo', tabBarIcon: ({ focused }) => icon('person', focused) }} />
    </Tabs>
  )
}
