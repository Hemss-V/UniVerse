// components/SpaceBackground.js
import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../config/colors';

const { width, height } = Dimensions.get('window');

const Star = ({ style }) => (
    <View style={[styles.star, style]} />
);

export default function SpaceBackground({ children }) {
    // Generate some random stars
    const stars = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        top: Math.random() * height,
        left: Math.random() * width,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.7 + 0.3,
    }));

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0B0D17', '#1B2735', '#2D1B35', '#0B0D17']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {stars.map((star) => (
                <Star
                    key={star.id}
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                        opacity: star.opacity,
                        borderRadius: star.size / 2,
                    }}
                />
            ))}

            {/* Soft Nebula Orbs */}
            <View style={[styles.nebula, { top: '10%', left: '-10%', backgroundColor: 'rgba(224, 38, 255, 0.15)' }]} />
            <View style={[styles.nebula, { bottom: '20%', right: '-20%', backgroundColor: 'rgba(0, 209, 255, 0.15)' }]} />

            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    star: {
        position: 'absolute',
        backgroundColor: '#FFF',
    },
    nebula: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
    }
});
