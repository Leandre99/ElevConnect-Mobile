import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const floatingBottom = Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : 24;

  return (
    <View style={[styles.tabBarWrapper, { bottom: floatingBottom }]}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          
          // Expo Router hides tabs via href: null, but React Navigation still passes them to the custom tab bar.
          // In expo-router, the internal options object usually contains `href` property.
          // Let's rely on our knowledge of hidden tabs: for Vet, farms and tasks are hidden.
          const { userRole } = useApp();
          if (userRole === 'vet' && (route.name === 'farms' || route.name === 'tasks')) {
            return null;
          }

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Resolve Icon Name
          let iconName: any = 'grid';
          if (route.name === 'index') iconName = isFocused ? 'grid' : 'grid-outline';
          if (route.name === 'farms') iconName = isFocused ? 'business' : 'business-outline';
          if (route.name === 'tasks') iconName = isFocused ? 'checkbox' : 'checkbox-outline';
          if (route.name === 'alerts') iconName = isFocused ? 'medical' : 'medical-outline';
          if (route.name === 'marketplace') iconName = isFocused ? 'cart' : 'cart-outline';
          if (route.name === 'profile') iconName = isFocused ? 'person' : 'person-outline';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={[styles.tabItem, isFocused && styles.tabItemFocused]}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={iconName} 
                size={22} 
                color={isFocused ? '#10B981' : '#94A3B8'} 
              />
              {isFocused && (
                <Text style={styles.tabLabelFocused} numberOfLines={1}>
                  {typeof label === 'string' ? label : route.name}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { userRole } = useApp();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="farms" options={{ title: 'Fermes' }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tâches' }} />
      <Tabs.Screen name="alerts" options={{ title: 'Santé' }} />
      <Tabs.Screen name="marketplace" options={{ title: 'Marché' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    left: 24, // Keeps it away from edges
    right: 24, // Keeps it away from edges
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingHorizontal: 8,
    paddingVertical: 8,
    elevation: 15, // Android shadow
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 30,
    gap: 6,
  },
  tabItemFocused: {
    backgroundColor: '#F0FDF4', // Very light green indicator
  },
  tabLabelFocused: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700',
  },
});
