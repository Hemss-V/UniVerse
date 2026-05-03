// App.js
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useFonts, Lobster_400Regular } from '@expo-google-fonts/lobster';
import { UserProvider } from './context/UserContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  let [fontsLoaded] = useFonts({ Lobster_400Regular });

  // 1. If fonts aren't ready, show a spinner (NOT null)
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  // 2. If loaded, show the app
  return (
    <UserProvider>
      <AppNavigator />
    </UserProvider>
  );
}