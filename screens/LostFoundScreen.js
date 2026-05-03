import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Image,
  TextInput, ActivityIndicator, Alert, ScrollView, Dimensions,
  LayoutAnimation, Platform, UIManager, StatusBar, Modal, KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import ConfettiCannon from 'react-native-confetti-cannon';

import { uploadToCloudinary } from '../utils/cloudinaryHelper';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import SpaceBackground from '../components/SpaceBackground';
import GlassmorphicView from '../components/GlassmorphicView';
import colors from '../config/colors';

const { width } = Dimensions.get('window');

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- 🎨 THEME CONFIG ---
const THEME = {
  primary: colors.primary,
  secondary: colors.accent1,
  accent: colors.secondary,
  bg: 'transparent',
};

// --- 📦 DATA STRUCTURE ---
const CATEGORIES = [
  {
    id: 'gadget',
    name: 'Gadgets',
    icon: 'phone-portrait',
    color: '#9b59b6',
    subs: ['Mobile Phone', 'Laptop', 'Smart Watch', 'Earbuds/Headphones', 'Charger/Cable', 'Powerbank', 'Calculator', 'Tablet']
  },
  {
    id: 'bottle',
    name: 'Bottles',
    icon: 'water',
    color: '#3498db',
    subs: ['Plastic Bottle', 'Metal/Thermos', 'Shaker', 'Glass Bottle', 'Coffee Mug']
  },
  {
    id: 'bag',
    name: 'Bags & Wallets',
    icon: 'briefcase',
    color: '#e67e22',
    subs: ['Backpack', 'Wallet/Purse', 'Handbag', 'Laptop Sleeve', 'Pouch', 'Gym Bag']
  },
  {
    id: 'id_card',
    name: 'ID & Keys',
    icon: 'card',
    color: '#e74c3c',
    subs: ['College ID Card', 'Room Keys', 'Vehicle Keys', 'ATM/Debit Card', 'Driving License']
  },
  {
    id: 'stationary',
    name: 'Stationary',
    icon: 'pencil',
    color: '#f1c40f',
    subs: ['Notebook/Register', 'Textbook', 'Pencil Pouch', 'Geometry Box', 'Assignment File', 'Lab Coat']
  },
  {
    id: 'clothing',
    name: 'Clothing',
    icon: 'shirt',
    color: '#2ecc71',
    subs: ['Jacket/Hoodie', 'Cap/Hat', 'Scarf', 'Shoes', 'Glasses/Spectacles', 'Watch (Analog)']
  },
];

// --- 🧠 SMART MATCHING ALGORITHM ---
const getLevenshteinDistance = (a, b) => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const checkFuzzyMatch = (userAns, realAns) => {
  if (!userAns || !realAns) return false;
  const a = userAns.toLowerCase().trim();
  const b = realAns.toLowerCase().trim();

  // 1. Exact Match
  if (a === b) return true;

  // 2. Contains Match (min length 3)
  if (a.length > 3 && b.includes(a)) return true;

  // 3. Fuzzy Match (Allow 2 typos)
  const distance = getLevenshteinDistance(a, b);
  return distance <= 2;
};

export default function LostFoundScreen({ navigation }) {
  const [mode, setMode] = useState('HOME'); // HOME, FOUND_FORM, LOST_FILTER, RESULTS
  const [loading, setLoading] = useState(false);

  // Confetti
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const confettiRef = useRef(null);

  // --- FINDER FORM STATE ---
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Fetching location...');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');

  // --- SEEKER SEARCH STATE ---
  const [searchBrand, setSearchBrand] = useState('');
  const [searchColor, setSearchColor] = useState('');
  const [foundItems, setFoundItems] = useState([]);
  const [unlockedItems, setUnlockedItems] = useState([]); // <--- NEW: Tracks which items the user unlocked

  // --- VERIFICATION STATE ---
  const [itemToVerify, setItemToVerify] = useState(null);
  const [verificationAnswer, setVerificationAnswer] = useState('');

  // --- 🪄 NAVIGATION HANDLER ---
  const navigateTo = (newMode) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMode(newMode);
  };

  const handleBack = () => {
    if (mode === 'HOME') navigation.goBack();
    else if (mode === 'RESULTS') navigateTo('LOST_FILTER');
    else navigateTo('HOME');
  };

  // --- 📍 GET LOCATION ---
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationName("Location Unknown");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    let address = await Location.reverseGeocodeAsync(location.coords);
    if (address.length > 0) {
      setLocationName(`${address[0].name || ''}, ${address[0].street || ''}`);
    }
  };

  // --- 📸 PICK IMAGE ---
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images, // Corrected from MediaTypeOptions
      allowsEditing: true, quality: 0.5,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  // --- 📤 SUBMIT FOUND ITEM ---
  const handleSubmitFound = async () => {
    if (!selectedCategory || !imageUri || !brand || !color) {
      Alert.alert("Missing Info", "Please fill in Category, Photo, Brand, and Color.");
      return;
    }
    setLoading(true);
    try {
      const imageUrl = await uploadToCloudinary(imageUri);
      await addDoc(collection(db, 'lost_found'), {
        type: 'FOUND',
        category: selectedCategory.id,
        subCategory: selectedSub || 'General',
        brand: brand.trim(),
        color: color.trim(),
        securityQuestion: securityQuestion.trim(),
        securityAnswer: securityAnswer.toLowerCase().trim(),
        description: description,
        imageUrl: imageUrl,
        locationName: locationName,
        userId: auth.currentUser.uid,
        finderName: auth.currentUser.displayName || "Anonymous",
        status: 'OPEN',
        createdAt: serverTimestamp()
      });
      triggerCelebration("Item Secured! 🔒\nThank you for helping.");
      resetForm();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not post item.");
    } finally {
      setLoading(false);
    }
  };

  // --- 🔍 SEARCH LOGIC ---
  const handleSearchLost = async () => {
    if (!selectedCategory) {
      Alert.alert("Wait!", "Please select a category first.");
      return;
    }
    setLoading(true);
    try {
      const q = query(
        collection(db, 'lost_found'),
        where('type', '==', 'FOUND'),
        where('category', '==', selectedCategory.id),
        where('status', '==', 'OPEN'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Client-Side Filtering (Brand/Color/Sub-Category)
      if (searchBrand || searchColor || selectedSub) {
        items = items.filter(item => {
          const brandMatch = searchBrand ? item.brand?.toLowerCase().includes(searchBrand.toLowerCase()) : true;
          const colorMatch = searchColor ? item.color?.toLowerCase().includes(searchColor.toLowerCase()) : true;
          const subMatch = selectedSub ? item.subCategory === selectedSub : true;
          return brandMatch && colorMatch && subMatch;
        });
      }

      setFoundItems(items);
      navigateTo('RESULTS');
    } catch (error) {
      console.error("Search Error:", error);
      Alert.alert("Database Error", "Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // --- 🔐 VERIFICATION LOGIC ---
  const verifyItem = () => {
    if (!itemToVerify) return;

    const isMatch = checkFuzzyMatch(verificationAnswer, itemToVerify.securityAnswer);

    if (isMatch) {
      // SUCCESS! Mark this item as unlocked.
      setUnlockedItems(prev => [...prev, itemToVerify.id]);
      setItemToVerify(null); // Close modal

      Alert.alert(
        "Identity Verified! ✅",
        "This item matches! You can now view the image and contact the finder.",
        [{ text: "Awesome!", onPress: () => triggerCelebration("Reunited at last! 🎉") }]
      );
    } else {
      Alert.alert("Incorrect", "That answer doesn't match the finder's record.");
    }
  };

  const triggerCelebration = (msg) => {
    setCelebrationMessage(msg);
    setShowConfetti(true);
    if (confettiRef.current) confettiRef.current.start();
    setTimeout(() => {
      setShowConfetti(false);
      // Removed automatic navigation home so the user can actually look at the unlocked item!
    }, 4000);
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setSelectedSub(null);
    setImageUri(null);
    setDescription('');
    setBrand(''); setColor('');
    setSecurityQuestion(''); setSecurityAnswer('');
    setLocationName('Fetching location...');
    setFoundItems([]);
    setUnlockedItems([]); // <--- Reset unlocked items memory when leaving
  };

  // --- 🧱 HEADER COMPONENT ---
  const Header = ({ title }) => (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  // --- 🖥️ SCREENS ---

  // 1. HOME
  const renderHome = () => (
    <View style={styles.centerContent}>
      <Header title="Lost & Found" />
      <View style={{ flex: 1, justifyContent: 'center', width: '100%', paddingHorizontal: 20 }}>
        <Text style={styles.heroTitle}>Did you lose something?</Text>
        <Text style={styles.heroSub}>Or help someone find theirs.</Text>

        <TouchableOpacity activeOpacity={0.9} style={styles.bigCard} onPress={() => navigateTo('LOST_FILTER')}>
          <LinearGradient colors={colors.pinkPurpleGradient} style={styles.cardGradient}>
            <Ionicons name="search" size={40} color="#fff" style={{ marginRight: 15 }} />
            <View>
              <Text style={styles.cardTitle}>I LOST Something</Text>
              <Text style={styles.cardSub}>Search & Match</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} style={[styles.bigCard, { marginTop: 20 }]} onPress={() => { navigateTo('FOUND_FORM'); getLocation(); }}>
          <LinearGradient colors={colors.bluePurpleGradient} style={styles.cardGradient}>
            <Ionicons name="add-circle-outline" size={40} color="#fff" style={{ marginRight: 15 }} />
            <View>
              <Text style={styles.cardTitle}>I FOUND Something</Text>
              <Text style={styles.cardSub}>Report & Secure</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  // 2. FINDER FORM
  const renderFoundForm = () => (
    <View style={styles.container}>
      <Header title="Report Found Item" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <GlassmorphicView style={{ padding: 0, borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>
          <TouchableOpacity style={styles.uploadContainer} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="camera" size={48} color="rgba(255,255,255,0.3)" />
                <Text style={styles.uploadText}>Tap to take a photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </GlassmorphicView>

        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} style={[styles.chip, selectedCategory?.id === cat.id && { backgroundColor: THEME.primary, borderColor: THEME.primary }]} onPress={() => { setSelectedCategory(cat); setSelectedSub(null); }}>
              <Text style={[styles.chipText, selectedCategory?.id === cat.id && { color: '#fff' }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedCategory && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.label}>Specific Type</Text>
            <View style={styles.gridContainer}>
              {selectedCategory.subs.map((sub) => (
                <TouchableOpacity
                  key={sub}
                  style={[styles.miniChip, selectedSub === sub && { backgroundColor: THEME.primary, borderColor: THEME.primary }]}
                  onPress={() => setSelectedSub(sub)}
                >
                  <Text style={[styles.miniChipText, selectedSub === sub && { color: '#fff' }]}>{sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.label}>Item Details</Text>
        <View style={styles.inputGroup}>
          <TextInput style={styles.textInput} placeholder="Brand (e.g. Apple)" placeholderTextColor="rgba(255,255,255,0.4)" value={brand} onChangeText={setBrand} />
          <View style={styles.divider} />
          <TextInput style={styles.textInput} placeholder="Color (e.g. Black)" placeholderTextColor="rgba(255,255,255,0.4)" value={color} onChangeText={setColor} />
        </View>

        <Text style={styles.label}>Security Question (Optional)</Text>
        <Text style={styles.helperText}>Ask something only the owner would know.</Text>
        <View style={styles.inputGroup}>
          <TextInput style={styles.textInput} placeholder="Q: e.g. What's on the lockscreen?" placeholderTextColor="rgba(255,255,255,0.4)" value={securityQuestion} onChangeText={setSecurityQuestion} />
          <View style={styles.divider} />
          <TextInput style={styles.textInput} placeholder="A: e.g. A dog" placeholderTextColor="rgba(255,255,255,0.4)" value={securityAnswer} onChangeText={setSecurityAnswer} />
        </View>

        <Text style={styles.label}>Location</Text>
        <View style={styles.locRow}>
          <Ionicons name="location" size={20} color={THEME.secondary} />
          <Text style={styles.locText}>{locationName}</Text>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitFound} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>SECURE & POST</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // 3. SEEKER FILTER
  const renderLostFilter = () => (
    <View style={styles.container}>
      <Header title="Find your item" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.label}>1. What is it?</Text>
        <View style={styles.gridContainer}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.id} style={styles.categoryCardWrapper} onPress={() => { setSelectedCategory(cat); setSelectedSub(null); }}>
              <GlassmorphicView style={[styles.categoryCard, selectedCategory?.id === cat.id && { borderColor: THEME.primary, borderWidth: 2 }]} intensity={20}>
                <LinearGradient colors={[cat.color, cat.color + '80']} style={styles.iconCircle}>
                  <Ionicons name={cat.icon} size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.categoryText}>{cat.name}</Text>
              </GlassmorphicView>
            </TouchableOpacity>
          ))}
        </View>

        {selectedCategory && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.label}>2. Filter by Type (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {selectedCategory.subs.map((sub) => (
                <TouchableOpacity
                  key={sub}
                  style={[styles.chip, { marginRight: 8 }, selectedSub === sub && { backgroundColor: THEME.primary, borderColor: THEME.primary }]}
                  onPress={() => setSelectedSub(selectedSub === sub ? null : sub)}
                >
                  <Text style={[styles.chipText, selectedSub === sub && { color: '#fff' }]}>{sub}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>3. Describe it</Text>
            <View style={styles.inputGroup}>
              <TextInput style={styles.textInput} placeholder="Brand (e.g. Apple)" placeholderTextColor="rgba(255,255,255,0.4)" value={searchBrand} onChangeText={setSearchBrand} />
              <View style={styles.divider} />
              <TextInput style={styles.textInput} placeholder="Color (e.g. Black)" placeholderTextColor="rgba(255,255,255,0.4)" value={searchColor} onChangeText={setSearchColor} />
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSearchLost}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>SEARCH MATCHES</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );

  // 4. RESULTS
  const renderResults = () => (
    <View style={styles.container}>
      <Header title="Matches Found" />
      <FlatList
        data={foundItems}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No matches found.</Text>
            <Text style={styles.emptySub}>Try broadening your search.</Text>
          </View>
        }
        renderItem={({ item }) => {
          // --- 🔓 NEW: Check if this item ID is in our unlocked memory! ---
          const isLocked = item.securityQuestion && item.securityQuestion.length > 0 && !unlockedItems.includes(item.id);

          return (
            <View style={styles.resultCardWrapper}>
              <GlassmorphicView style={styles.resultCard} intensity={25} padding={0}>
                {isLocked ? (
                  <View style={[styles.resultImage, { backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="lock-closed" size={32} color="rgba(255,255,255,0.3)" />
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 5 }}>Protected Item</Text>
                  </View>
                ) : (
                  <Image source={{ uri: item.imageUrl }} style={styles.resultImage} />
                )}

                <View style={styles.resultInfo}>
                  <Text style={styles.resultTitle}>{item.subCategory || item.brand}</Text>
                  <Text style={styles.resultLoc}>{item.color} • {item.brand}</Text>
                  <Text style={styles.resultLoc}>📍 {item.locationName}</Text>

                  {isLocked ? (
                    <TouchableOpacity style={[styles.claimBtn, { backgroundColor: colors.accent1 }]} onPress={() => { setItemToVerify(item); setVerificationAnswer(''); }}>
                      <Text style={styles.claimText}>Unlock to View</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.claimBtn} onPress={() => Alert.alert("Contact Finder", `Reach out to: ${item.finderName}\nEmail: finder@college.edu`)}>
                      <Text style={styles.claimText}>Contact Finder</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </GlassmorphicView>
            </View>
          );
        }}
      />
    </View>
  );

  return (
    <SpaceBackground>
      <SafeAreaView style={styles.mainContainer} edges={['top']}>
        <StatusBar barStyle="light-content" />

        {mode === 'HOME' && renderHome()}
        {mode === 'LOST_FILTER' && renderLostFilter()}
        {mode === 'RESULTS' && renderResults()}
        {mode === 'FOUND_FORM' && renderFoundForm()}

        {/* 🔐 VERIFICATION MODAL */}
        <Modal visible={itemToVerify !== null} transparent animationType="fade">
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <GlassmorphicView style={styles.modalCard} intensity={90}>
              <View style={styles.modalHeader}>
                <Ionicons name="shield-checkmark" size={24} color={THEME.primary} />
                <Text style={styles.modalTitle}>Security Check</Text>
              </View>
              <Text style={styles.modalSub}>The finder asked a question to verify ownership:</Text>

              <View style={styles.questionBox}>
                <Text style={styles.questionText}>"{itemToVerify?.securityQuestion}"</Text>
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="Type your answer..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={verificationAnswer}
                onChangeText={setVerificationAnswer}
                autoFocus
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setItemToVerify(null)} style={styles.cancelBtn}>
                  <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={verifyItem} style={styles.verifyBtn}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Verify Answer</Text>
                </TouchableOpacity>
              </View>
            </GlassmorphicView>
          </KeyboardAvoidingView>
        </Modal>

        {/* 🎉 CONFETTI */}
        {showConfetti && (
          <View style={styles.confettiOverlay} pointerEvents="none">
            <ConfettiCannon ref={confettiRef} count={200} origin={{ x: -10, y: 0 }} fadeOut={true} />
            <View style={styles.celebrationCard}>
              <Text style={styles.celebrationText}>{celebrationMessage}</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  container: { flex: 1 },
  centerContent: { flex: 1, alignItems: 'center' },

  // Header
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', zIndex: 10 },
  backButton: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.white },

  // Home
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: colors.white, marginTop: 20 },
  heroSub: { fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 40 },
  bigCard: { width: '100%', height: 120, borderRadius: 25 },
  cardGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 25, padding: 20 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  cardSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },

  // Forms & Inputs
  uploadContainer: { height: 200, overflow: 'hidden' },
  uploadedImage: { width: '100%', height: '100%' },
  uploadPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  uploadText: { marginTop: 10, color: 'rgba(255,255,255,0.4)', fontSize: 16 },
  label: { fontSize: 15, fontWeight: '700', color: colors.white, marginBottom: 10, marginTop: 15 },
  helperText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginRight: 10, backgroundColor: 'rgba(255,255,255,0.05)' },
  chipText: { fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  miniChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginRight: 8, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
  miniChipText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },

  inputGroup: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  textInput: { fontSize: 16, color: colors.white, padding: 15 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 15 },

  locRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  locText: { marginLeft: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  submitBtn: { marginTop: 30, backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 20, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

  // Filter Grid
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCardWrapper: { width: '48%', marginBottom: 15 },
  categoryCard: { width: '100%', padding: 20, borderRadius: 20, alignItems: 'center' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  categoryText: { fontSize: 14, fontWeight: '600', color: colors.white },

  // Results
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: colors.white, marginTop: 10 },
  emptySub: { color: 'rgba(255,255,255,0.5)', marginTop: 5 },
  resultCardWrapper: { width: (width / 2) - 20, margin: 8 },
  resultCard: { width: '100%', borderRadius: 20, overflow: 'hidden' },
  resultImage: { width: '100%', height: 140 },
  resultInfo: { padding: 12 },
  resultTitle: { fontSize: 14, fontWeight: '700', color: colors.white, marginBottom: 2 },
  resultLoc: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 10 },
  claimBtn: { backgroundColor: colors.primary, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  claimText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', borderRadius: 25, padding: 0 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingHorizontal: 25, paddingTop: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10, color: colors.white },
  modalSub: { color: 'rgba(255,255,255,0.6)', marginBottom: 15, paddingHorizontal: 25 },
  questionBox: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 15, marginBottom: 20, marginHorizontal: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  questionText: { fontSize: 16, fontWeight: '600', color: colors.secondary, fontStyle: 'italic', textAlign: 'center' },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 15, fontSize: 16, marginBottom: 20, marginHorizontal: 25, color: colors.white },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', paddingBottom: 25, paddingRight: 25 },
  cancelBtn: { padding: 15, marginRight: 10 },
  verifyBtn: { backgroundColor: colors.primary, paddingHorizontal: 25, paddingVertical: 15, borderRadius: 15 },

  // Confetti
  confettiOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)' },
  celebrationCard: { backgroundColor: 'white', padding: 30, borderRadius: 30, alignItems: 'center', elevation: 10 },
  celebrationText: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#333', lineHeight: 28 }
});