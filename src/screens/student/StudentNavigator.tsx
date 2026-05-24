import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { StudentHomeScreen } from './StudentHomeScreen';
import { StudentAriaScreen } from './StudentAriaScreen';
import { StudentGradesScreen } from './StudentGradesScreen';
import { StudentHomeworkScreen } from './StudentHomeworkScreen';
import { StudentCompeteScreen } from './StudentCompeteScreen';

const Tab = createBottomTabNavigator();
const PURPLE = '#6D28D9';

const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

export const StudentNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E2E8F0', paddingBottom: 6, height: 60 },
      tabBarActiveTintColor: PURPLE,
      tabBarInactiveTintColor: '#94A3B8',
      tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
    })}
  >
    <Tab.Screen name="Home" component={StudentHomeScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />, tabBarLabel: 'Home' }} />
    <Tab.Screen name="Aria" component={StudentAriaScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View style={{ position: 'relative' }}>
            <TabIcon emoji="✨" focused={focused} />
            {!focused && <View style={{ position: 'absolute', top: -2, right: -4, width: 7, height: 7, borderRadius: 4, backgroundColor: PURPLE, borderWidth: 1.5, borderColor: '#F8FAFC' }} />}
          </View>
        ),
        tabBarLabel: 'Aria',
      }} />
    <Tab.Screen name="Grades" component={StudentGradesScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />, tabBarLabel: 'Grades' }} />
    <Tab.Screen name="Homework" component={StudentHomeworkScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📚" focused={focused} />, tabBarLabel: 'Homework' }} />
    <Tab.Screen name="Compete" component={StudentCompeteScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" focused={focused} />, tabBarLabel: 'Compete' }} />
  </Tab.Navigator>
);
