import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import SpaceBackground from '../components/SpaceBackground';
import GlassmorphicView from '../components/GlassmorphicView';
import colors from '../config/colors';

// Firebase & Cloudinary
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { uploadToCloudinary } from '../utils/cloudinaryHelper';

// Context to get current user info quickly if needed
import { UserContext } from '../context/UserContext';

export default function CreatePostScreen({ navigation }) {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images, // Corrected from MediaTypeOptions
      quality: 0.7, // Slightly higher quality for posts
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!caption && !image) {
      Alert.alert("Empty Post", "Please write something or add a photo.");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      let imageUrl = null;

      // 1. Upload Image (if selected)
      if (image) {
        imageUrl = await uploadToCloudinary(image);
      }

      // 2. Save Post to Firestore
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        username: user.displayName || "Anonymous",
        userProfilePic: user.photoURL || "https://ui-avatars.com/api/?name=User", // Snapshot of user pic

        caption: caption,
        imageUrl: imageUrl, // The Cloudinary link

        likes: [], // Array of userIds who liked
        comments: 0,
        createdAt: serverTimestamp() // Auto-server time
      });

      setLoading(false);
      Alert.alert("Success", "Post shared!");
      navigation.goBack(); // Return to Home Feed

    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert("Error", "Could not share post.");
    }
  };

  return (
    <SpaceBackground>
      <SafeAreaView style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.postButton, loading && { opacity: 0.5 }]}
            onPress={handlePost}
            disabled={loading}
          >
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        {/* Input Section */}
        <View style={styles.inputWrapper}>
          <GlassmorphicView style={styles.glassInput} intensity={20}>
            <TextInput
              style={styles.textInput}
              placeholder="What's happening on campus?"
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              value={caption}
              onChangeText={setCaption}
            />

            {image && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: image }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removeImage} onPress={() => setImage(null)}>
                  <Ionicons name="close-circle" size={24} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </GlassmorphicView>
        </View>

        {/* Footer / Toolbar */}
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color={colors.accent1} />
            <Text style={styles.toolText}>Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolButton}>
            <Ionicons name="camera-outline" size={24} color={colors.accent1} />
            <Text style={styles.toolText}>Camera</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  postButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  postButtonText: { color: '#fff', fontWeight: 'bold' },
  inputWrapper: { flex: 1, padding: 15 },
  glassInput: { flex: 1, borderRadius: 25, padding: 15 },
  textInput: { fontSize: 18, color: colors.white, textAlignVertical: 'top' },
  previewContainer: { position: 'relative', marginTop: 15, borderRadius: 15, overflow: 'hidden' },
  previewImage: { width: '100%', height: 300 },
  removeImage: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 15 },
  toolbar: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginBottom: Platform.OS === 'ios' ? 0 : 10
  },
  toolButton: { flexDirection: 'row', alignItems: 'center', marginRight: 25 },
  toolText: { marginLeft: 8, color: colors.accent1, fontWeight: '600' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  }
});