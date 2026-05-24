import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, ROLES } from '../utils/design';
import Chatbot from '../components/shared/Chatbot';

import LoginScreen from '../screens/auth/LoginScreen';

import {
  StudentHome, HomeworkScreen, ProgressScreen, AskAIScreen, CompetitionScreen,
} from '../screens/student';

import {
  ParentHome, AttendanceCalendarScreen, FeePaymentScreen, BusTrackingScreen,
  TeacherHome, TeacherAttendanceScreen, TeacherHomeworkScreen,
  TeacherSyllabusScreen, TeacherStudentsScreen,
  AdminHome, AdminFeesScreen, AdminNotifyScreen, SupportTicketsScreen, AdminUsersScreen,
  PrincipalHome, DriverHome, SuperAdminHome,
} from '../screens/AllRoleScreens';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ─── Shared config ────────────────────────────────────────────────────────────
const screenOptions = {
  headerShown: true,
  headerStyle: { backgroundColor: colors.white },
  headerTitleStyle: { fontWeight: '700' as const, color: colors.gray900, fontSize: 17 },
  headerShadowVisible: false,
  headerTintColor: colors.brand,
};

const tabBarStyle = {
  backgroundColor: colors.white,
  borderTopWidth: 0.5,
  borderTopColor: colors.gray200,
  height: 64,
  paddingBottom: 8,
  paddingTop: 6,
};

const tabLabelStyle = { fontSize: 10, fontWeight: '600' as const };

function withChatbot(component: React.ReactElement) {
  return (
    <View style={{ flex: 1 }}>
      {component}
      <Chatbot />
    </View>
  );
}

// ─── Exported login screen ────────────────────────────────────────────────────
export { LoginScreen };

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════════
function StudentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentHomeMain" component={StudentHome} />
    </Stack.Navigator>
  );
}

export function StudentNavigator() {
  const c = ROLES.student.color;
  return withChatbot(
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle,
      tabBarActiveTintColor: c,
      tabBarInactiveTintColor: colors.gray400,
      tabBarLabelStyle: tabLabelStyle,
      tabBarIcon: ({ focused, color }) => {
        const icons: Record<string, [string, string]> = {
          Home: ['home', 'home-outline'],
          Homework: ['book', 'book-outline'],
          AskAI: ['sparkles', 'sparkles-outline'],
          Progress: ['bar-chart', 'bar-chart-outline'],
          Compete: ['trophy', 'trophy-outline'],
        };
        const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
        return <Ionicons name={(focused ? active : inactive) as any} size={22} color={color} />;
      },
    })}>
      <Tab.Screen name="Home" component={StudentStack} />
      <Tab.Screen name="Homework" component={HomeworkScreen} options={{ ...screenOptions, title: 'Homework' }} />
      <Tab.Screen name="AskAI" component={AskAIScreen} options={{ ...screenOptions, title: 'Ask AI' }} />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ ...screenOptions, title: 'My Progress' }} />
      <Tab.Screen name="Compete" component={CompetitionScreen} options={{ ...screenOptions, title: 'Competition' }} />
    </Tab.Navigator>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARENT NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════════
function ParentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ParentHomeMain" component={ParentHome} />
    </Stack.Navigator>
  );
}

export function ParentNavigator() {
  const c = ROLES.parent.color;
  return withChatbot(
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle,
      tabBarActiveTintColor: c,
      tabBarInactiveTintColor: colors.gray400,
      tabBarLabelStyle: tabLabelStyle,
      tabBarIcon: ({ focused, color }) => {
        const icons: Record<string, [string, string]> = {
          Home: ['home', 'home-outline'],
          Attendance: ['calendar', 'calendar-outline'],
          Fees: ['card', 'card-outline'],
          Bus: ['bus', 'bus-outline'],
        };
        const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
        return <Ionicons name={(focused ? active : inactive) as any} size={22} color={color} />;
      },
    })}>
      <Tab.Screen name="Home" component={ParentStack} />
      <Tab.Screen name="Attendance" component={AttendanceCalendarScreen} options={{ ...screenOptions, title: 'Attendance' }} />
      <Tab.Screen name="Fees" component={FeePaymentScreen} options={{ ...screenOptions, title: 'Fee Payment' }} />
      <Tab.Screen name="Bus" component={BusTrackingScreen} options={{ ...screenOptions, title: 'Bus Tracking' }} />
    </Tab.Navigator>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEACHER NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════════
function TeacherStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherHomeMain" component={TeacherHome} />
      <Stack.Screen name="Attendance" component={TeacherAttendanceScreen} options={{ ...screenOptions, title: 'Mark Attendance' }} />
      <Stack.Screen name="Homework" component={TeacherHomeworkScreen} options={{ ...screenOptions, title: 'Homework' }} />
      <Stack.Screen name="Syllabus" component={TeacherSyllabusScreen} options={{ ...screenOptions, title: 'Syllabus' }} />
      <Stack.Screen name="Students" component={TeacherStudentsScreen} options={{ ...screenOptions, title: 'Students' }} />
    </Stack.Navigator>
  );
}

export function TeacherNavigator() {
  const c = ROLES.teacher.color;
  return withChatbot(
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle,
      tabBarActiveTintColor: c,
      tabBarInactiveTintColor: colors.gray400,
      tabBarLabelStyle: tabLabelStyle,
      tabBarIcon: ({ focused, color }) => {
        const icons: Record<string, [string, string]> = {
          Home: ['home', 'home-outline'],
          Tickets: ['help-circle', 'help-circle-outline'],
        };
        const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
        return <Ionicons name={(focused ? active : inactive) as any} size={22} color={color} />;
      },
    })}>
      <Tab.Screen name="Home" component={TeacherStack} />
      <Tab.Screen name="Tickets" component={SupportTicketsScreen} options={{ ...screenOptions, title: 'Support' }} />
    </Tab.Navigator>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════════
function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHomeMain" component={AdminHome} />
      <Stack.Screen name="Users" component={AdminUsersScreen} options={{ ...screenOptions, title: 'User Management' }} />
      <Stack.Screen name="Fees" component={AdminFeesScreen} options={{ ...screenOptions, title: 'Fee Management' }} />
      <Stack.Screen name="Notify" component={AdminNotifyScreen} options={{ ...screenOptions, title: 'Send Notification' }} />
      <Stack.Screen name="Tickets" component={SupportTicketsScreen} options={{ ...screenOptions, title: 'Support Tickets' }} />
    </Stack.Navigator>
  );
}

export function AdminNavigator() {
  const c = ROLES.admin.color;
  return withChatbot(
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle,
      tabBarActiveTintColor: c,
      tabBarInactiveTintColor: colors.gray400,
      tabBarLabelStyle: tabLabelStyle,
      tabBarIcon: ({ focused, color }) => {
        const icons: Record<string, [string, string]> = {
          Home: ['home', 'home-outline'],
          Users: ['people', 'people-outline'],
          Fees: ['card', 'card-outline'],
          Notify: ['megaphone', 'megaphone-outline'],
        };
        const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
        return <Ionicons name={(focused ? active : inactive) as any} size={22} color={color} />;
      },
    })}>
      <Tab.Screen name="Home" component={AdminStack} />
      <Tab.Screen name="Users" component={AdminUsersScreen} options={{ ...screenOptions, title: 'Users' }} />
      <Tab.Screen name="Fees" component={AdminFeesScreen} options={{ ...screenOptions, title: 'Fees' }} />
      <Tab.Screen name="Notify" component={AdminNotifyScreen} options={{ ...screenOptions, title: 'Notify' }} />
    </Tab.Navigator>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRINCIPAL NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════════
export function PrincipalNavigator() {
  const c = ROLES.principal.color;
  return withChatbot(
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle,
      tabBarActiveTintColor: c,
      tabBarInactiveTintColor: colors.gray400,
      tabBarLabelStyle: tabLabelStyle,
      tabBarIcon: ({ focused, color }) => {
        const icons: Record<string, [string, string]> = {
          Overview: ['school', 'school-outline'],
          Tickets: ['help-circle', 'help-circle-outline'],
        };
        const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
        return <Ionicons name={(focused ? active : inactive) as any} size={22} color={color} />;
      },
    })}>
      <Tab.Screen name="Overview" component={PrincipalHome} options={{ headerShown: false }} />
      <Tab.Screen name="Tickets" component={SupportTicketsScreen} options={{ ...screenOptions, title: 'Tickets' }} />
    </Tab.Navigator>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DRIVER NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════════
export function DriverNavigator() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { ...tabBarStyle, backgroundColor: colors.darkCard, borderTopColor: colors.darkBorder },
      tabBarActiveTintColor: ROLES.driver.color,
      tabBarInactiveTintColor: colors.darkMuted,
      tabBarLabelStyle: tabLabelStyle,
      tabBarIcon: ({ focused, color }) => {
        const icons: Record<string, [string, string]> = {
          Route: ['navigate', 'navigate-outline'],
          Support: ['help-circle', 'help-circle-outline'],
        };
        const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
        return <Ionicons name={(focused ? active : inactive) as any} size={22} color={color} />;
      },
    })}>
      <Tab.Screen name="Route" component={DriverHome} />
      <Tab.Screen name="Support" component={SupportTicketsScreen} options={{ ...screenOptions, title: 'Support' }} />
    </Tab.Navigator>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUPER ADMIN NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════════
function SuperAdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SuperAdminHomeMain" component={SuperAdminHome} />
    </Stack.Navigator>
  );
}

export function SuperAdminNavigator() {
  return withChatbot(
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle,
      tabBarActiveTintColor: colors.brand,
      tabBarInactiveTintColor: colors.gray400,
      tabBarLabelStyle: tabLabelStyle,
      tabBarIcon: ({ focused, color }) => {
        const icons: Record<string, [string, string]> = {
          Dashboard: ['grid', 'grid-outline'],
          Schools: ['business', 'business-outline'],
        };
        const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
        return <Ionicons name={(focused ? active : inactive) as any} size={22} color={color} />;
      },
    })}>
      <Tab.Screen name="Dashboard" component={SuperAdminStack} />
      <Tab.Screen name="Schools" component={SuperAdminHome} options={{ ...screenOptions, title: 'All Schools' }} />
    </Tab.Navigator>
  );
}
