import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { ParentHomeScreen } from './ParentHomeScreen';
import { ParentAttendanceScreen, ParentFeeScreen, ParentBusScreen, ParentProgressScreen, ParentNotificationsScreen } from './ParentScreens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ParentHomeMain" component={ParentHomeScreen} />
    <Stack.Screen name="Notifications" component={ParentNotificationsScreen} />
    <Stack.Screen name="Progress" component={ParentProgressScreen} />
  </Stack.Navigator>
);

const Ico = ({ e, c }: { e: string; c: string }) => <Text style={{ fontSize: 22, color: c }}>{e}</Text>;

export const ParentNavigator: React.FC = () => (
  <Tab.Navigator screenOptions={{ headerShown: false,
    tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#E2E8F0', height: 64, paddingBottom: 8, paddingTop: 6 },
    tabBarActiveTintColor: '#7C2D12', tabBarInactiveTintColor: '#94A3B8',
    tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
  }}>
    <Tab.Screen name="Home"       component={HomeStack}               options={{ tabBarIcon: ({ color }) => <Ico e="🏠" c={color} />, tabBarLabel: 'Home' }} />
    <Tab.Screen name="Attendance" component={ParentAttendanceScreen}  options={{ tabBarIcon: ({ color }) => <Ico e="📅" c={color} />, tabBarLabel: 'Attendance' }} />
    <Tab.Screen name="Fees"       component={ParentFeeScreen}         options={{ tabBarIcon: ({ color }) => <Ico e="💰" c={color} />, tabBarLabel: 'Fees' }} />
    <Tab.Screen name="Bus"        component={ParentBusScreen}         options={{ tabBarIcon: ({ color }) => <Ico e="🚌" c={color} />, tabBarLabel: 'Bus' }} />
  </Tab.Navigator>
);
