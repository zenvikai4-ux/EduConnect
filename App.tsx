import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useStore } from './src/store';
import { colors } from './src/utils/design';
import {
  LoginScreen,
  StudentNavigator, ParentNavigator, TeacherNavigator,
  AdminNavigator, PrincipalNavigator, DriverNavigator, SuperAdminNavigator,
} from './src/navigation/AppNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 3 * 60 * 1000, gcTime: 10 * 60 * 1000 },
  },
});

function RoleRouter() {
  const { isLoggedIn, user, isLoading, hydrate } = useStore();

  useEffect(() => { hydrate(); }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  if (!isLoggedIn || !user) return <LoginScreen />;

  switch (user.role) {
    case 'student':      return <StudentNavigator />;
    case 'parent':       return <ParentNavigator />;
    case 'teacher':
    case 'class_teacher': return <TeacherNavigator />;
    case 'admin':        return <AdminNavigator />;
    case 'principal':    return <PrincipalNavigator />;
    case 'driver':       return <DriverNavigator />;
    case 'super_admin':  return <SuperAdminNavigator />;
    default:             return <LoginScreen />;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <RoleRouter />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
});
