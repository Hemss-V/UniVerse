// screens/ClubChatScreen.js

import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SpaceBackground from '../components/SpaceBackground';
import GlassmorphicView from '../components/GlassmorphicView';
import colors from '../config/colors';

// Import Firebase
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../config/firebase'; // <--- IMPORT AUTH

export default function ClubChatScreen({ route, navigation }) {
  const { clubName, clubId } = route.params || { clubName: 'General', clubId: 'general' };

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  // 1. LISTEN FOR MESSAGES
  useLayoutEffect(() => {
    const collectionRef = collection(db, 'clubs', clubId, 'messages');
    const q = query(collectionRef, orderBy('createdAt', 'desc')); // Show newest first

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map(doc => ({
          _id: doc.id,
          text: doc.data().text,
          createdAt: doc.data().createdAt,
          senderName: doc.data().senderName, // Real Name
          senderEmail: doc.data().senderEmail, // Real Email (for ID check)
        }))
      );
    });

    return unsubscribe;
  }, [clubId]);

  // 2. SEND REAL MESSAGE
  const sendMessage = async () => {
    if (inputText.trim().length === 0) return;

    // Get the current user's info
    const user = auth.currentUser;

    const collectionRef = collection(db, 'clubs', clubId, 'messages');

    await addDoc(collectionRef, {
      text: inputText,
      // Use the name from Signup, or Email if name is missing
      senderName: user.displayName || user.email,
      senderEmail: user.email,
      createdAt: serverTimestamp()
    });

    setInputText('');
  };

  const renderMessage = ({ item }) => {
    // Check if THIS message was sent by ME
    const isMe = item.senderEmail === auth.currentUser?.email;

    return (
      <View style={[
        styles.messageBubble,
        isMe ? styles.myMessage : styles.theirMessage
      ]}>
        {/* Show Sender Name only if it is NOT me */}
        {!isMe && <Text style={styles.senderName}>{item.senderName}</Text>}

        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SpaceBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlassmorphicView style={styles.header} intensity={30}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{clubName}</Text>
        </GlassmorphicView>

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item._id}
          inverted // Scroll from bottom up (like WhatsApp)
          contentContainerStyle={styles.listContent}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <GlassmorphicView style={styles.inputContainer} intensity={40} tint="dark">
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </GlassmorphicView>
        </KeyboardAvoidingView>
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
    padding: 15,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  listContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  senderName: {
    fontSize: 12,
    color: colors.accent1,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: 'white',
  },
  theirMessageText: {
    color: colors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderRadius: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 12,
    maxHeight: 100,
    color: colors.white,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
});