// screens/SignupScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import colors from '../config/colors';
import SpaceBackground from '../components/SpaceBackground';
import GlassmorphicView from '../components/GlassmorphicView';

// Imports
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { uploadToCloudinary } from '../utils/cloudinaryHelper';

export default function SignupScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  // Personal Info
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [bio, setBio] = useState('');

  // Academic Info
  const [rollNumber, setRollNumber] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [section, setSection] = useState('');

  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' or 'staff'

  // 1. Pick Image Function
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSignup = async () => {
    // Validation
    if (!fullName || !email || !password || !rollNumber) {
      Alert.alert('Missing Fields', 'Please fill in Name, Email, Password, and Roll No.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Upload Image (Cloudinary or Fallback)
      let profilePicUrl = null;

      if (image) {
        // Upload to Cloudinary
        profilePicUrl = await uploadToCloudinary(image);
      } else {
        // Generate Initials Avatar
        profilePicUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&color=fff&size=256`;
      }

      // 3. Save User Data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName: fullName,
        username: username || ("@" + fullName.replace(/\s/g, '').toLowerCase()),
        email: email,
        mobile: mobile,
        dob: dob,
        bio: bio,
        profilePic: profilePicUrl, // The Cloudinary Link!

        rollNumber: rollNumber,
        course: course,
        year: year,
        semester: semester,
        section: section,

        section: section,

        role: role,
        adminStatus: 'none',
        createdAt: new Date().toISOString(),

        connections: 0,
        friendsCount: 0,
        clubsFollowing: []
      });

      // 4. Update Auth Profile
      await updateProfile(user, {
        displayName: fullName,
        photoURL: profilePicUrl
      });

      setLoading(false);
      Alert.alert('Success!', 'Account created successfully.');
      navigation.navigate('Login');

    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SpaceBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <GlassmorphicView style={styles.glassCard}>

            <Text style={styles.title}>Create Profile</Text>

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleButton, role === 'student' && styles.activeRoleButton]}
                onPress={() => setRole('student')}
              >
                <Ionicons name="school" size={20} color={role === 'student' ? colors.white : 'rgba(255,255,255,0.6)'} />
                <Text style={[styles.roleButtonText, role === 'student' && styles.activeRoleButtonText]}>Student</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleButton, role === 'staff' && styles.activeRoleButton]}
                onPress={() => setRole('staff')}
              >
                <Ionicons name="briefcase" size={20} color={role === 'staff' ? colors.white : 'rgba(255,255,255,0.6)'} />
                <Text style={[styles.roleButtonText, role === 'staff' && styles.activeRoleButtonText]}>Staff / Prof</Text>
              </TouchableOpacity>
            </View>

            {/* Profile Picture Picker */}
            <View style={styles.imageContainer}>
              <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.profileImage} />
                ) : (
                  <View style={styles.placeholder}>
                    <Ionicons name="camera" size={40} color="#666" />
                    <Text style={styles.uploadText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeader}>Personal Info</Text>
            <TextInput style={styles.input} placeholder="Full Name *" value={fullName} onChangeText={setFullName} />
            <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
            <TextInput style={styles.input} placeholder="Mobile Number" keyboardType="phone-pad" value={mobile} onChangeText={setMobile} />
            <TextInput style={styles.input} placeholder="Date of Birth (DD/MM/YYYY)" value={dob} onChangeText={setDob} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Bio / Description" multiline numberOfLines={3} value={bio} onChangeText={setBio} />

            <Text style={styles.sectionHeader}>College Details</Text>
            <TextInput style={styles.input} placeholder="Roll Number / ID *" value={rollNumber} onChangeText={setRollNumber} />
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.halfInput]} placeholder="Course (B.Tech)" value={course} onChangeText={setCourse} />
              <TextInput style={[styles.input, styles.halfInput]} placeholder="Section" value={section} onChangeText={setSection} />
            </View>
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.halfInput]} placeholder="Year" value={year} onChangeText={setYear} />
              <TextInput style={[styles.input, styles.halfInput]} placeholder="Semester" value={semester} onChangeText={setSemester} />
            </View>

            <Text style={styles.sectionHeader}>Login Details</Text>
            <TextInput style={styles.input} placeholder="Email *" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Password *" secureTextEntry value={password} onChangeText={setPassword} />

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>Complete Registration</Text>
              </TouchableOpacity>
            )}
          </GlassmorphicView>
          <View style={{ height: 50 }} />
        </ScrollView>
      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  glassCard: { padding: 20, borderRadius: 25 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.white, textAlign: 'center', marginBottom: 20 },
  imageContainer: { alignItems: 'center', marginBottom: 20 },
  imagePicker: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  profileImage: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center' },
  uploadText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 5 },
  sectionHeader: { fontSize: 18, fontWeight: '600', color: colors.primary, marginTop: 10, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 5 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: colors.white },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  button: { backgroundColor: colors.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20, shadowColor: colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  buttonText: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 5,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  activeRoleButton: {
    backgroundColor: colors.primary,
  },
  roleButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  activeRoleButtonText: {
    color: colors.white,
  },
});
