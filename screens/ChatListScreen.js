import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SpaceBackground from '../components/SpaceBackground';
import GlassmorphicView from '../components/GlassmorphicView';
import colors from '../config/colors';

export default function ChatListScreen({ navigation }) {
    return (
        <SpaceBackground>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Messages</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <GlassmorphicView style={styles.placeholderCard} intensity={30}>
                        <Ionicons name="chatbubbles-outline" size={60} color={colors.accent1} />
                        <Text style={styles.placeholderTitle}>Your Inbox</Text>
                        <Text style={styles.placeholderSub}>Direct messages are being prepared for launch. Connect with peers soon!</Text>
                    </GlassmorphicView>
                </ScrollView>
            </SafeAreaView>
        </SpaceBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)'
    },
    backButton: { marginRight: 15 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.white },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    placeholderCard: {
        alignItems: 'center',
        padding: 40,
        borderRadius: 30
    },
    placeholderTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
        marginTop: 20
    },
    placeholderSub: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        marginTop: 10
    }
});
