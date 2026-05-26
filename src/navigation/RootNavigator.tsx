import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useStore } from '../store';
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
  const { isLoggedIn, user, isLoading, hydrate } = useStore();

  useEffect(() => { hydrate(); }, []);

  if (isLoading) return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primaryDark }}>
          <ActivityIndicator size="large" color={Colors.white} />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );

  // role from useStore user
  const role = user?.role;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
            {!isLoggedIn ? (
              <Stack.Screen name="Login" component={LoginScreen} />
            ) : (
              <>
                {role === 'super_admin' && <Stack.Screen name="SuperAdmin" component={SuperAdminNavigator} />}
                {role === 'admin' && <Stack.Screen name="Admin" component={AdminNavigator} />}
                {role === 'principal' && <Stack.Screen name="Admin" component={AdminNavigator} />}
                {role === 'teacher' && <Stack.Screen name="Teacher" component={TeacherNavigator} />}
                {role === 'class_teacher' && <Stack.Screen name="Teacher" component={TeacherNavigator} />}
                {role === 'parent' && <Stack.Screen name="Parent" component={ParentNavigator} />}
                {role === 'student' && <Stack.Screen name="Student" component={StudentNavigator} />}
                {role === 'driver' && <Stack.Screen name="Driver" component={DriverNavigator} />}
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
