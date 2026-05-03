// screens/OtpScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Use the correct import
import colors from '../config/colors';

export default function OtpScreen({ route, navigation }) {
  const [otp, setOtp] = useState('');

  // Get the user data passed from the Signup screen
  const { name, department, year, email, password } = route.params;

  const handleVerifyOtp = () => {
    // --- NEXT STEP will be here ---
    // We will:
    // 1. Make a 'fetch' request to our backend /verify-otp endpoint.
    // 2. If successful, we'll create the Firebase account.

    console.log('Verifying OTP:', otp);
    console.log('With user data:', { name, email });
    Alert.alert('WIP', 'Next step: Call backend to verify this OTP!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        We sent a 6-digit code to {'\n'} {email}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="6-Digit Code"
        placeholderTextColor={colors.grey}
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Verify Code"
          onPress={handleVerifyOtp}
          color={colors.primary}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.grey,
    marginBottom: 30,
  },
  input: {
    height: 45,
    borderColor: colors.secondary,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
    color: colors.black,
  },
  buttonContainer: {
    borderRadius: 5,
    overflow: 'hidden',
  },
});