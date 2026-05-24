import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants/theme';

import LoginScreen from '../screens/auth/LoginScreen';
import { SuperAdminNavigator } from '../screens/superadmin/SuperAdminNavigator';
import { AdminNavigator } from '../screens/admin/AdminNavigator';
import { TeacherNavigator } from '../screens/teacher/TeacherNavigator';
import { ParentNavigator } from '../screens/parent/ParentNavigator';
import { StudentNavigator } from '../screens/student/StudentNavigator';
import { DriverNavigator } from '../screens/driver/DriverNavigator';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, user, isLoading, restoreSession } = useAuthStore();
  useEffect(() => { restoreSession(); }, []);

  if (isLoading) return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primaryDark }}>
          <ActivityIndicator size="large" color={Colors.white} />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
            {!isAuthenticated ? (
              <Stack.Screen name="Login" component={LoginScreen} />
            ) : (
              <>
                {user?.role === 'superadmin' && <Stack.Screen name="SuperAdmin" component={SuperAdminNavigator} />}
                {user?.role === 'admin' && <Stack.Screen name="Admin" component={AdminNavigator} />}
                {user?.role === 'teacher' && <Stack.Screen name="Teacher" component={TeacherNavigator} />}
                {user?.role === 'parent' && <Stack.Screen name="Parent" component={ParentNavigator} />}
                {user?.role === 'student' && <Stack.Screen name="Student" component={StudentNavigator} />}
                {user?.role === 'driver' && <Stack.Screen name="Driver" component={DriverNavigator} />}
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
