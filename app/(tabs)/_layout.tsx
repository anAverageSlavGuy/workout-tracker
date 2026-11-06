import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../constants/colors'

type IconName = keyof typeof Ionicons.glyphMap

function icon(name: IconName, focused: boolean) {
  const outlineName = (String(name) + '-outline') as IconName
  return <Ionicons name={focused ? name : outlineName} size={22} color={focused ? colors.accent : colors.textDim} />
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceHigh,
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          height: 74,
          paddingTop: 8,
          paddingBottom: 10,
          marginHorizontal: 14,
          marginBottom: 12,
          borderRadius: 28,
          position: 'absolute',
          elevation: 8,
          shadowColor: '#171614',
          shadowOpacity: 0.16,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ focused }) => icon('home', focused) }} />
      <Tabs.Screen name="templates" options={{ title: 'Schede', tabBarIcon: ({ focused }) => icon('list', focused) }} />
      <Tabs.Screen name="history" options={{ title: 'Storico', tabBarIcon: ({ focused }) => icon('time', focused) }} />
      <Tabs.Screen name="nutrition" options={{ title: 'Nutrition', tabBarIcon: ({ focused }) => icon('nutrition', focused) }} />
      <Tabs.Screen name="more" options={{ title: 'Altro', tabBarIcon: ({ focused }) => icon('ellipsis-horizontal', focused) }} />
      <Tabs.Screen name="stats" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  )
}
