// screens/LoginScreen.js

import React, { useState, useContext } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../config/colors';
import AppTitle from '../components/AppTitle';
import SpaceBackground from '../components/SpaceBackground';
import GlassmorphicView from '../components/GlassmorphicView';

// Import Firebase Auth
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase'; // <--- Import auth
import { UserContext } from '../context/UserContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the global state setter
  const { setIsLoggedIn } = useContext(UserContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Ask Firebase: "Is this user real?"
      await signInWithEmailAndPassword(auth, email, password);

      // 2. If yes, Flip the switch to show the Feed
      setLoading(false);
      setIsLoggedIn(true);

    } catch (error) {
      setLoading(false);
      // Handle Login Errors
      let msg = error.message;
      if (msg.includes('invalid-credential') || msg.includes('user-not-found') || msg.includes('wrong-password')) {
        msg = 'Invalid email or password.';
      }
      Alert.alert('Login Failed', msg);
    }
  };

  return (
    <SpaceBackground>
      <SafeAreaView style={styles.container}>
        <GlassmorphicView style={styles.glassCard}>
          <AppTitle />

          <Text style={styles.subtitle}>Welcome Back!</Text>

          <TextInput
            style={styles.input}
            placeholder="College Email"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.linkContainer}>
            <Text style={styles.linkText}>Don't have an account? <Text style={styles.bold}>Sign Up</Text></Text>
          </TouchableOpacity>
        </GlassmorphicView>
      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  glassCard: {
    padding: 30,
    borderRadius: 30,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 55,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  button: {
    backgroundColor: colors.primary,
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 25,
    alignItems: 'center',
  },
  linkText: {
    color: 'rgba(255,255,255,0.6)',
  },
  bold: {
    fontWeight: 'bold',
    color: colors.primary,
  }
});
