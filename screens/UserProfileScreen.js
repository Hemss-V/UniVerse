import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SpaceBackground from '../components/SpaceBackground';
import GlassmorphicView from '../components/GlassmorphicView';
import colors from '../config/colors';

// Firebase
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const { width } = Dimensions.get('window');
const IMG_SIZE = width / 3 - 2; // 3 columns with tiny gap

export default function UserProfileScreen({ route, navigation }) {
  // We get the userId from the navigation parameters
  const { userId } = route.params;

  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = userId === auth.currentUser?.uid;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get User Info
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }

        // 2. Get User's Posts (Ordered by newest)
        const postsQ = query(
          collection(db, "posts"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
        const postsSnap = await getDocs(postsQ);
        const postsData = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserPosts(postsData);

      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const renderPostImage = ({ item }) => (
    <TouchableOpacity onPress={() => console.log("Open Post Detail", item.id)}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.gridImage}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SpaceBackground>
      <View style={styles.container}>
        {/* 🔙 Header with Back Button */}
        <SafeAreaView edges={['top']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{userProfile?.username || "Profile"}</Text>
          <View style={{ width: 28 }} />
        </SafeAreaView>

        <FlatList
          data={userPosts}
          keyExtractor={item => item.id}
          numColumns={3}
          renderItem={renderPostImage}
          contentContainerStyle={{ paddingBottom: 50 }}
          ListHeaderComponent={
            <>
              {/* 🌈 Profile Card */}
              <View style={styles.profileSection}>
                <GlassmorphicView style={styles.profileGlass} intensity={30}>
                  <View style={styles.avatarContainer}>
                    <LinearGradient colors={colors.pinkPurpleGradient} style={styles.avatarRing}>
                      <Image
                        source={{ uri: userProfile?.profilePic || "https://ui-avatars.com/api/?name=User" }}
                        style={styles.avatar}
                      />
                    </LinearGradient>
                  </View>

                  <Text style={styles.name}>{userProfile?.fullName || "Student"}</Text>
                  <Text style={styles.bio}>{userProfile?.bio || "Computer Science • Batch of 2026"}</Text>

                  {/* Stats */}
                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <Text style={styles.statNum}>{userPosts.length}</Text>
                      <Text style={styles.statLabel}>Posts</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.stat}>
                      <Text style={styles.statNum}>{userProfile?.followers?.length || 0}</Text>
                      <Text style={styles.statLabel}>Followers</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.stat}>
                      <Text style={styles.statNum}>{userProfile?.following?.length || 0}</Text>
                      <Text style={styles.statLabel}>Following</Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionRow}>
                    {isOwnProfile ? (
                      <TouchableOpacity style={styles.editBtn}>
                        <Text style={styles.editBtnText}>Edit Profile</Text>
                      </TouchableOpacity>
                    ) : (
                      <>
                        <TouchableOpacity style={styles.followBtn}>
                          <Text style={styles.followBtnText}>Follow</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.messageBtn}>
                          <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.white} />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </GlassmorphicView>
              </View>

              {/* Grid Divider */}
              <View style={styles.gridHeader}>
                <Ionicons name="grid" size={20} color={colors.primary} />
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ color: 'gray' }}>No posts yet.</Text>
            </View>
          }
        />
      </View>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 10, backgroundColor: 'rgba(255,255,255,0.05)' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.white },

  // Profile Section
  profileSection: { padding: 15 },
  profileGlass: { alignItems: 'center', paddingVertical: 25, borderRadius: 25 },
  avatarRing: { width: 94, height: 94, borderRadius: 47, justifyContent: 'center', alignItems: 'center' },
  avatar: { width: 86, height: 86, borderRadius: 43, borderWidth: 3, borderColor: colors.background },
  name: { fontSize: 22, fontWeight: 'bold', marginTop: 15, color: colors.white },
  bio: { color: 'rgba(255,255,255,0.6)', marginTop: 5, fontSize: 14, textAlign: 'center', paddingHorizontal: 20 },

  // Stats
  statsRow: { flexDirection: 'row', marginTop: 25, alignItems: 'center' },
  stat: { alignItems: 'center', paddingHorizontal: 20 },
  statNum: { fontSize: 18, fontWeight: 'bold', color: colors.white },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  divider: { height: 20, width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },

  // Actions
  actionRow: { flexDirection: 'row', marginTop: 25 },
  followBtn: { backgroundColor: colors.primary, paddingHorizontal: 35, paddingVertical: 10, borderRadius: 20, marginRight: 10 },
  followBtnText: { color: '#fff', fontWeight: 'bold' },
  messageBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 20 },
  editBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 35, paddingVertical: 10, borderRadius: 20 },
  editBtnText: { fontWeight: '600', color: colors.white },

  // Grid
  gridHeader: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingVertical: 15, alignItems: 'center', marginTop: 10 },
  gridImage: { width: IMG_SIZE, height: IMG_SIZE, margin: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  emptyState: { alignItems: 'center', marginTop: 50 },
});