// components/AppTitle.js

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import colors from '../config/colors';

export default function AppTitle() {
  return (
    <MaskedView
      style={styles.maskView}
      maskElement={
        <Text style={[styles.text, { backgroundColor: 'transparent' }]}>
          UniVerse
        </Text>
      }
    >
      <LinearGradient
        colors={colors.pinkPurpleGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  maskView: {
    height: 60, // Adjust height as needed
    marginBottom: 20, // Add some space below the title
  },
  text: {
    fontSize: 50, // Big font size
    fontFamily: 'Lobster_400Regular', // The loaded font
    fontWeight: '400', // Required for custom fonts
    textAlign: 'center',
  },
  gradient: {
    flex: 1,
  },
});