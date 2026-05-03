// screens/CampusMapScreen.js
import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    Platform,
    Linking // <--- Added for external map links
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import SpaceBackground from '../components/SpaceBackground';
import GlassmorphicView from '../components/GlassmorphicView';
import colors from '../config/colors';

const { width, height } = Dimensions.get('window');

// SNU Chennai Coordinates (Approximate)
const CAMPUS_URL = 'https://www.google.com/maps/search/?api=1&query=Shiv+Nadar+University+Chennai';

export default function CampusMapScreen({ navigation }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <SpaceBackground>
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={28} color={colors.white} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Campus Navigation</Text>
                    <View style={{ width: 28 }} />
                </Animated.View>

                {/* Map Container */}
                <Animated.View style={[styles.mapWrapper, { opacity: fadeAnim }]}>
                    <GlassmorphicView style={styles.glassContainer}>
                        {Platform.OS !== 'web' ? (
                            <WebView
                                source={{ uri: CAMPUS_URL }}
                                style={styles.map}
                                startInLoadingState={true}
                                originWhitelist={['*']}
                                onShouldStartLoadWithRequest={(request) => {
                                    // Handle external app links (like intent:// or maps://)
                                    if (
                                        !request.url.startsWith('http://') &&
                                        !request.url.startsWith('https://') &&
                                        !request.url.startsWith('about:blank')
                                    ) {
                                        try {
                                            Linking.openURL(request.url);
                                            return false; // Don't let WebView load it
                                        } catch (err) {
                                            console.warn('Failed to open external URL:', err);
                                            return false;
                                        }
                                    }
                                    return true; // Let WebView load http/https links
                                }}
                                renderLoading={() => (
                                    <View style={styles.loading}>
                                        <Text style={styles.loadingText}>Loading Campus Map...</Text>
                                    </View>
                                )}
                            />
                        ) : (
                            <View style={styles.webPlaceholder}>
                                <Ionicons name="map" size={80} color="rgba(255,255,255,0.2)" />
                                <Text style={styles.placeholderText}>Map View is optimized for Mobile</Text>
                                <TouchableOpacity
                                    style={styles.externalLink}
                                    onPress={() => window.open(CAMPUS_URL, '_blank')}
                                >
                                    <Text style={styles.linkText}>Open in Google Maps</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </GlassmorphicView>
                </Animated.View>

                {/* Info Card */}
                <Animated.View style={[styles.infoCard, { transform: [{ translateY: slideAnim }] }]}>
                    <GlassmorphicView style={styles.infoGlass}>
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={24} color={colors.primary} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoTitle}>SNU Chennai</Text>
                                <Text style={styles.infoSub}>Kalavakkam, Tamil Nadu</Text>
                            </View>
                        </View>
                        <Text style={styles.description}>
                            Explore the campus facilities, departments, and recreational areas directly from this interactive map.
                        </Text>
                    </GlassmorphicView>
                </Animated.View>

            </SafeAreaView>
        </SpaceBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        padding: 8,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.white,
        letterSpacing: 1,
    },
    mapWrapper: {
        flex: 1,
        marginHorizontal: 20,
        marginVertical: 10,
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    glassContainer: {
        flex: 1,
        padding: 0,
        borderRadius: 30,
    },
    map: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loading: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a1a',
    },
    loadingText: {
        color: colors.white,
        marginTop: 10,
    },
    webPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    placeholderText: {
        color: 'rgba(255,255,255,0.6)',
        marginTop: 15,
        fontSize: 16,
        textAlign: 'center',
    },
    externalLink: {
        marginTop: 20,
        paddingHorizontal: 25,
        paddingVertical: 12,
        backgroundColor: colors.primary,
        borderRadius: 20,
    },
    linkText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    infoCard: {
        padding: 20,
        paddingBottom: 40,
    },
    infoGlass: {
        borderRadius: 25,
        padding: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoTextContainer: {
        marginLeft: 15,
    },
    infoTitle: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoSub: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
    },
    description: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        lineHeight: 20,
    },
});
