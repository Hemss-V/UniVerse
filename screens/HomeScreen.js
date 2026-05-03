// screens/HomeScreen.js
import React, { useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  Linking, // <--- Critical for opening apps
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { UserContext } from '../context/UserContext';
import { auth } from '../config/firebase';
import SpaceBackground from '../components/SpaceBackground';
import GlassmorphicView from '../components/GlassmorphicView';
import colors from '../config/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width / 2) - 25;

// --- 🛠️ Dashboard Configuration ---
const features = [
  {
    id: 1,
    name: "College Feed",
    icon: "newspaper",
    colors: colors.pinkPurpleGradient,
    screen: "Feed"
  },
  {
    id: 2,
    name: "Club Updates",
    icon: "people",
    colors: colors.bluePurpleGradient,
    screen: "Clubs"
  },
  {
    id: 3,
    name: "Events",
    icon: "calendar",
    colors: ["#F2994A", "#F2C94C"], // Sunshine Gradient
    screen: "Events"
  },
  {
    id: 4,
    name: "Lost & Found",
    icon: "search",
    colors: ["#11998e", "#38ef7d"], // Nature Gradient
    screen: "LostFound"
  },
  {
    id: 5,
    name: "Find Prof",
    icon: "school",
    colors: ["#8E2DE2", "#4A00E0"], // Royal Gradient
    screen: "FindProfessor"
  },
  {
    id: 6,
    name: "Chats",
    icon: "chatbubbles",
    colors: ["#eb3349", "#f45c43"], // Cherry Gradient
    screen: "ChatList"
  },
  {
    id: 7,
    name: "Campus Map",
    icon: "map",
    colors: ["#667eea", "#764ba2"], // Indigo/Violet Gradient
    screen: "CampusMap"
  },
];

// --- 🪄 The Animated Card Component ---
const AnimatedCard = ({ item, index, navigation }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance Animation
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true })
      ])
    ]).start();

    // 2. Continuous Float
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -5, duration: 2000, delay: index * 300, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const handlePress = () => {
    try {
      if (item.screen === "Feed" || item.screen === "Clubs") {
        navigation.navigate(item.screen);
      } else {
        navigation.navigate(item.screen);
      }
    } catch (e) {
      alert("Feature coming soon!");
    }
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }, { translateY: floatAnim }] }}>
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
        <GlassmorphicView style={styles.card}>
          <LinearGradient colors={item.colors} style={styles.iconCircle}>
            <Ionicons name={item.icon} size={28} color={colors.white} />
          </LinearGradient>
          <Text style={styles.cardText}>{item.name}</Text>
          <View style={[styles.decorativeCircle, { backgroundColor: item.colors[0] }]} />
        </GlassmorphicView>
      </TouchableOpacity>
    </Animated.View>
  );
};

// --- 🏠 Main Dashboard Screen ---
export default function HomeScreen({ navigation }) {
  const { user } = useContext(UserContext);
  const firstName = user?.displayName?.split(' ')[0] || "Student";

  // 🚀 ROBUST MOODLE LINKING
  const openMoodle = async () => {
    const appUrl = 'moodlemobile://';
    const webUrl = 'https://lms.snuchennai.edu.in/'; // Fallback

    // 1. If Web, go straight to browser
    if (Platform.OS === 'web') {
      Linking.openURL(webUrl);
      return;
    }

    // 2. If Mobile, TRY app first, CATCH error if missing
    try {
      await Linking.openURL(appUrl);
    } catch (error) {
      console.log("Moodle app not found, opening browser fallback.");
      await Linking.openURL(webUrl);
    }
  };

  return (
    <SpaceBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good Morning,</Text>
              <Text style={styles.username}>{firstName}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Image
                source={{ uri: auth.currentUser?.photoURL || "https://ui-avatars.com/api/?name=" + firstName }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>

          {/* 🎓 MOODLE CARD */}
          <TouchableOpacity activeOpacity={0.9} onPress={openMoodle} style={styles.moodleContainer}>
            <LinearGradient
              colors={['#FF6B6B', '#556270']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.moodleCard}
            >
              <View>
                <Text style={styles.moodleTitle}>Access Moodle</Text>
                <Text style={styles.moodleSub}>Assignments, Grades & Notes</Text>
              </View>
              <View style={styles.moodleIconBox}>
                <Ionicons name="school-outline" size={32} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* 🔮 The Grid */}
          <Text style={styles.sectionTitle}>Explore</Text>
          <View style={styles.gridContainer}>
            {features.map((item, index) => (
              <AnimatedCard key={item.id} item={item} index={index} navigation={navigation} />
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 10, marginBottom: 20 },
  greeting: { fontSize: 16, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  username: { fontSize: 28, fontWeight: 'bold', color: colors.white },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: colors.primary },
  moodleContainer: { marginHorizontal: 20, marginBottom: 25 },
  moodleCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 25, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 8 },
  moodleTitle: { color: colors.white, fontSize: 20, fontWeight: 'bold' },
  moodleSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  moodleIconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 25, marginBottom: 15, color: colors.white },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 },
  card: { width: CARD_WIDTH, height: 140, borderRadius: 30, padding: 0, marginBottom: 20, justifyContent: 'space-between', position: 'relative', overflow: 'hidden' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', margin: 15 },
  cardText: { color: colors.white, fontSize: 17, fontWeight: 'bold', zIndex: 10, marginLeft: 15, marginBottom: 15 },
  decorativeCircle: { position: 'absolute', right: -20, bottom: -20, width: 80, height: 80, borderRadius: 40, opacity: 0.2 }
});
