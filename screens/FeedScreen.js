import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Animated,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SpaceBackground from '../components/SpaceBackground';
import GlassmorphicView from '../components/GlassmorphicView';
import colors from '../config/colors';

// Firebase
import {
  collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, limit, addDoc, serverTimestamp, increment
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const SCREEN_WIDTH = Dimensions.get('window').width;

// --- 💬 MINI COMMENT COMPONENT ---
const CommentItem = ({ item }) => (
  <View style={styles.miniComment}>
    <Text style={styles.miniCommentText}>
      <Text style={styles.usernameBold}>{item.username} </Text>
      {item.text}
    </Text>
  </View>
);

// --- 🎨 POST CARD COMPONENT ---
const PostCard = ({ item, navigation, currentUserId, index }) => {
  // Animation & State
  const scaleValue = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Comment State
  const [showComments, setShowComments] = useState(false);
  const [previewComments, setPreviewComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const isLiked = item.likes?.includes(currentUserId);
  const likeCount = item.likes ? item.likes.length : 0;
  const commentCount = item.comments || 0;

  // 1. Entry Animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay: index * 100, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 6, tension: 40, delay: index * 100, useNativeDriver: true })
    ]).start();
  }, []);

  // 2. Fetch Preview Comments (Only runs when expanded)
  useEffect(() => {
    if (showComments) {
      setLoadingComments(true);
      // Fetch only top 2 latest comments
      const q = query(collection(db, 'posts', item.id, 'comments'), orderBy('createdAt', 'desc'), limit(2));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setPreviewComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoadingComments(false);
      });
      return () => unsubscribe();
    }
  }, [showComments]);

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const handleLike = async () => {
    Animated.sequence([
      Animated.spring(scaleValue, { toValue: 1.2, friction: 3, useNativeDriver: true }),
      Animated.spring(scaleValue, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    const postRef = doc(db, 'posts', item.id);
    try {
      if (isLiked) {
        await updateDoc(postRef, { likes: arrayRemove(currentUserId) });
      } else {
        await updateDoc(postRef, { likes: arrayUnion(currentUserId) });
      }
    } catch (error) { console.error("Like error:", error); }
  };

  const handleQuickComment = async () => {
    if (newComment.trim() === '') return;
    const text = newComment;
    setNewComment(''); // Clear UI instantly

    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'posts', item.id, 'comments'), {
        text: text,
        userId: user.uid,
        username: user.displayName || 'Student',
        userProfilePic: user.photoURL,
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'posts', item.id), { comments: increment(1) });
    } catch (error) { console.error(error); }
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out this post by ${item.username} on UniVerse!` });
    } catch (error) { console.error(error); }
  };

  return (
    <Animated.View style={[styles.cardContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <GlassmorphicView style={{ padding: 0 }} intensity={30}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <TouchableOpacity style={styles.userInfo} onPress={() => navigation.navigate('UserProfile', { userId: item.userId })}>
            <View style={styles.avatarContainer}>
              <LinearGradient colors={colors.pinkPurpleGradient} style={styles.avatarRing}>
                <Image source={{ uri: item.userProfilePic || "https://ui-avatars.com/api/?name=User" }} style={styles.avatar} />
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.location}>Campus • {item.createdAt ? new Date(item.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</Text>
            </View>
          </TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.6)" />
        </View>

        {/* Image */}
        {item.imageUrl && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.postImage} resizeMode="cover" />
          </View>
        )}

        {/* Action Bar */}
        <View style={styles.actionBar}>
          <View style={styles.leftActions}>
            <TouchableOpacity onPress={handleLike}>
              <Animated.View style={{ transform: [{ scale: isLiked ? 1 : scaleValue.interpolate({ inputRange: [0, 1], outputRange: [1, 1] }) }] }}>
                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={28} color={isLiked ? colors.accent1 : colors.white} />
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={toggleComments}>
              <Ionicons name="chatbubble-outline" size={26} color={colors.white} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
              <Ionicons name="paper-plane-outline" size={26} color={colors.white} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <Ionicons name="bookmark-outline" size={26} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Likes & Caption */}
        <View style={styles.textContainer}>
          <Text style={styles.likesText}>{likeCount} likes</Text>
          {item.caption ? (
            <Text style={styles.caption}>
              <Text style={styles.usernameBold}>{item.username}</Text> {item.caption}
            </Text>
          ) : null}

          {/* Toggle View Comments Button */}
          {commentCount > 0 && (
            <TouchableOpacity onPress={toggleComments} style={{ marginTop: 5 }}>
              <Text style={styles.viewCommentsText}>
                {showComments ? "Hide comments" : `View all ${commentCount} comments`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* --- 🔽 DROPDOWN COMMENTS SECTION --- */}
        {showComments && (
          <View style={styles.commentSection}>
            {loadingComments ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                {/* List Top 2 Comments */}
                {previewComments.map((comment) => (
                  <CommentItem key={comment.id} item={comment} />
                ))}

                {/* "See More" Link if > 2 comments */}
                {commentCount > 2 && (
                  <TouchableOpacity onPress={() => navigation.navigate('Comments', { postId: item.id })}>
                    <Text style={styles.seeMoreText}>See more comments...</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* Inline Input Box */}
            <View style={styles.inlineInputContainer}>
              <Image
                source={{ uri: auth.currentUser?.photoURL || "https://ui-avatars.com/api/?name=Me" }}
                style={styles.miniAvatar}
              />
              <TextInput
                style={styles.inlineInput}
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
                placeholderTextColor="rgba(255,255,255,0.4)"
              />
              {newComment.length > 0 && (
                <TouchableOpacity onPress={handleQuickComment}>
                  <Text style={styles.postBtnText}>Post</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </GlassmorphicView>
    </Animated.View>
  );
};


// --- MAIN SCREEN ---
export default function FeedScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <SpaceBackground>
      <View style={styles.headerGlass}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Text style={styles.appTitle}>UniVerse</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.headerBtn}><Ionicons name="heart-outline" size={24} color={colors.white} /></TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn}><Ionicons name="paper-plane-outline" size={24} color={colors.white} /></TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.feedWrapper}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={posts}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <PostCard item={item} navigation={navigation} currentUserId={currentUserId} index={index} />
            )}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <TouchableOpacity activeOpacity={0.8} style={styles.fabContainer} onPress={() => navigation.navigate('CreatePost')}>
        <LinearGradient colors={colors.pinkPurpleGradient} style={styles.fab}>
          <Ionicons name="add" size={32} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGlass: { paddingBottom: 15, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, backgroundColor: 'rgba(255,255,255,0.05)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', zIndex: 100 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appTitle: { fontSize: 28, color: colors.white, fontFamily: 'Lobster_400Regular' },
  headerIcons: { flexDirection: 'row' },
  headerBtn: { marginLeft: 15 },
  feedWrapper: { flex: 1 },

  // Post Card
  cardContainer: { marginHorizontal: 15, marginBottom: 20, borderRadius: 25, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { marginRight: 10 },
  avatarRing: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: colors.background },
  username: { fontWeight: '700', fontSize: 15, color: colors.white },
  location: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  imageContainer: { width: '100%', height: 400 },
  postImage: { width: '100%', height: '100%' },
  actionBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: 15, paddingBottom: 10 },
  leftActions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginLeft: 20 },
  textContainer: { paddingHorizontal: 15, paddingBottom: 15 },
  likesText: { fontWeight: 'bold', fontSize: 14, marginBottom: 5, color: colors.white },
  caption: { fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.9)' },
  usernameBold: { fontWeight: '700', color: colors.white },
  viewCommentsText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 },

  // FAB
  fabContainer: { position: 'absolute', bottom: 25, right: 25, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  fab: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },

  // --- NEW COMMENT STYLES ---
  commentSection: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginTop: 5,
    paddingTop: 10
  },
  miniComment: {
    marginBottom: 6,
    flexDirection: 'row',
  },
  miniCommentText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18
  },
  seeMoreText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 5
  },
  inlineInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10
  },
  inlineInput: {
    flex: 1,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    paddingHorizontal: 15,
    fontSize: 13,
    marginRight: 10,
    color: colors.white
  },
  postBtnText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 13
  }
});