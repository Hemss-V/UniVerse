// screens/ProfileScreen.js

import React, { useContext, useEffect, useState } from 'react'; // Added useEffect, useState
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SpaceBackground from '../components/SpaceBackground';
import GlassmorphicView from '../components/GlassmorphicView';
import colors from '../config/colors';

// Firebase Imports
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore tools
import { auth, db } from '../config/firebase'; // Import db

// Context
import { UserContext } from '../context/UserContext';

export default function ProfileScreen() {
  const { setIsLoggedIn } = useContext(UserContext);
  const [profileData, setProfileData] = useState(null); // Store real user data here
  const [loading, setLoading] = useState(true);

  // 1. FETCH REAL USER DATA
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Get the document from "users" collection
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setProfileData(userDoc.data());
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Use real data if available, otherwise fallback to Auth defaults
  const displayName = profileData?.fullName || auth.currentUser?.displayName || "Student";
  const email = profileData?.email || auth.currentUser?.email || "student@college.edu";
  // The Magic Fix: Use the Cloudinary link from Firestore, or a fallback avatar
  const profileImage = profileData?.profilePic || auth.currentUser?.photoURL || "https://ui-avatars.com/api/?name=User";

  // Fake Stats (You can make these real later too!)
  const stats = {
    clubs: profileData?.clubsFollowing?.length || 0,
    events: 12,
  };

  const handleLogout = () => {
    const performLogout = () => {
      signOut(auth)
        .then(() => setIsLoggedIn(false))
        .catch((error) => console.error(error));
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to log out?")) performLogout();
    } else {
      Alert.alert("Log Out", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: performLogout }
      ]);
    }
  };

  const MenuItem = ({ icon, text, onPress, isDestructive = false }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <GlassmorphicView style={styles.menuItemGlass} intensity={10}>
        <View style={styles.menuItemLeft}>
          <View style={[styles.iconContainer, isDestructive && styles.destructiveIcon]}>
            <Ionicons name={icon} size={22} color={isDestructive ? '#FF3B30' : colors.primary} />
          </View>
          <Text style={[styles.menuText, isDestructive && styles.destructiveText]}>{text}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
      </GlassmorphicView>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SpaceBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Header Section */}
          <GlassmorphicView style={styles.header} intensity={30}>
            <Image
              source={{ uri: profileImage }}
              style={styles.avatar}
            />
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{email}</Text>

            <View style={styles.tagContainer}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{profileData?.role || "Student"}</Text>
              </View>
            </View>
          </GlassmorphicView>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <GlassmorphicView style={styles.statItemGlass} intensity={20}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.clubs}</Text>
                <Text style={styles.statLabel}>Clubs</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.events}</Text>
                <Text style={styles.statLabel}>Events</Text>
              </View>
            </GlassmorphicView>
          </View>

          {/* Menu Options */}
          <View style={styles.menuContainer}>
            <Text style={styles.sectionTitle}>Account</Text>
            <MenuItem icon="person-outline" text="Edit Profile" onPress={() => { }} />
            <MenuItem icon="notifications-outline" text="Notifications" onPress={() => { }} />
            <MenuItem icon="lock-closed-outline" text="Privacy & Security" onPress={() => { }} />

            <Text style={styles.sectionTitle}>More</Text>
            <MenuItem icon="help-circle-outline" text="Help & Support" onPress={() => { }} />
            <MenuItem icon="log-out-outline" text="Log Out" isDestructive onPress={handleLogout} />
          </View>

        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: 30, borderRadius: 0, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 2, borderColor: colors.primary },
  name: { fontSize: 24, fontWeight: 'bold', color: colors.white, marginBottom: 5 },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 15 },
  tagContainer: { flexDirection: 'row' },
  tag: { backgroundColor: colors.accent2, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 15, marginHorizontal: 5 },
  tagText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  statsContainer: { marginTop: 20, paddingHorizontal: 20 },
  statItemGlass: { flexDirection: 'row', padding: 0, borderRadius: 20 },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 15 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 10 },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: colors.secondary },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  menuContainer: { paddingVertical: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.4)', marginLeft: 10, marginBottom: 10, marginTop: 15, textTransform: 'uppercase' },
  menuItem: { marginBottom: 10 },
  menuItemGlass: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderRadius: 15 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  destructiveIcon: { backgroundColor: 'rgba(255, 59, 48, 0.1)' },
  menuText: { fontSize: 16, color: colors.white },
  destructiveText: { color: '#FF3B30' },
});