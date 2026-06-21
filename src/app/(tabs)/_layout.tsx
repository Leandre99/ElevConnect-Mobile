import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useApp } from '@/context/AppContext';

export default function TabsLayout() {
  const { userRole } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10B981', // Emerald 500
        tabBarInactiveTintColor: '#64748B', // Slate 400
        tabBarStyle: {
          backgroundColor: '#FFFFFF', 
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingTop: 8,
          minHeight: 60, // Let safe-area handle the bottom padding automatically
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="farms"
        options={{
          title: 'Fermes',
          tabBarLabel: 'Fermes',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'business' : 'business-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tâches',
          tabBarLabel: 'Tâches',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'checkbox' : 'checkbox-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Santé',
          tabBarLabel: 'Santé',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'medical' : 'medical-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Marché',
          tabBarLabel: 'Marché',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cart' : 'cart-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
