import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { StudentHomeScreen } from './StudentHomeScreen';
import { StudentGradesScreen } from './StudentGradesScreen';
import { StudentHomeworkScreen } from './StudentHomeworkScreen';
import { StudentCompeteScreen } from './StudentCompeteScreen';
import { StudentAriaScreen } from './StudentAriaScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Ico = ({ e, c }: { e: string; c: string }) => <Text style={{ fontSize: 22, color: c }}>{e}</Text>;

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StudentHomeMain" component={StudentHomeScreen} />
  </Stack.Navigator>
);

export const StudentNavigator: React.FC = () => (
  <Tab.Navigator screenOptions={{ headerShown: false,
    tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#E2E8F0', height: 64, paddingBottom: 8, paddingTop: 6 },
    tabBarActiveTintColor: '#1E3A8A', tabBarInactiveTintColor: '#94A3B8',
    tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
  }}>
    <Tab.Screen name="Home"     component={HomeStack}             options={{ tabBarIcon: ({ color }) => <Ico e="🏠" c={color} />, tabBarLabel: 'Home' }} />
    <Tab.Screen name="Aria"     component={StudentAriaScreen}     options={{ tabBarIcon: ({ color }) => <Ico e="✨" c={color} />, tabBarLabel: 'Aria AI' }} />
    <Tab.Screen name="Homework" component={StudentHomeworkScreen} options={{ tabBarIcon: ({ color }) => <Ico e="📝" c={color} />, tabBarLabel: 'Homework' }} />
    <Tab.Screen name="Grades"   component={StudentGradesScreen}   options={{ tabBarIcon: ({ color }) => <Ico e="📊" c={color} />, tabBarLabel: 'Progress' }} />
    <Tab.Screen name="Compete"  component={StudentCompeteScreen}  options={{ tabBarIcon: ({ color }) => <Ico e="🏆" c={color} />, tabBarLabel: 'Compete' }} />
  </Tab.Navigator>
);
