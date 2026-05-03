// components/GlassmorphicView.js
import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import colors from '../config/colors';

export default function GlassmorphicView({ children, style, intensity = 40, tint = "dark" }) {
    return (
        <View style={[styles.container, style]}>
            <BlurView
                intensity={intensity}
                tint={tint}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    content: {
        padding: 20,
    }
});
