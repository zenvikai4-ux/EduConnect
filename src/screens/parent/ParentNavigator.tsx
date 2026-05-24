import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { ParentHomeScreen } from './ParentHomeScreen';
import { ParentAriaScreen } from './ParentAriaScreen';
import { ParentProgressScreen, ParentFeesScreen, ParentMessagesScreen } from './ParentScreens';

const Tab = createBottomTabNavigator();
const COLOR = '#7C2D12';

const Icon = ({ e, focused }: { e: string; focused: boolean }) => (
  <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>{e}</Text>
);

export const ParentNavigator: React.FC = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: COLOR, tabBarInactiveTintColor: '#94A3B8', tabBarLabelStyle: { fontSize: 10, fontWeight: '600' }, tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E2E8F0', paddingBottom: 6, height: 60 } }}>
    <Tab.Screen name="Home" component={ParentHomeScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="🏠" focused={focused} /> }} />
    <Tab.Screen name="Progress" component={ParentProgressScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="📊" focused={focused} /> }} />
    <Tab.Screen name="Fees" component={ParentFeesScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="💰" focused={focused} /> }} />
    <Tab.Screen name="Aria" component={ParentAriaScreen} options={{ tabBarIcon: ({ focused }) => (
      <View style={{ position: 'relative' }}>
        <Icon e="✨" focused={focused} />
        {!focused && <View style={{ position: 'absolute', top: -2, right: -4, width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.aria, borderWidth: 1.5, borderColor: '#F8FAFC' }} />}
      </View>
    ), tabBarLabel: 'Aria' }} />
    <Tab.Screen name="Messages" component={ParentMessagesScreen} options={{ tabBarIcon: ({ focused }) => <Icon e="💬" focused={focused} /> }} />
  </Tab.Navigator>
);
