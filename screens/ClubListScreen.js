// screens/ClubListScreen.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SpaceBackground from '../components/SpaceBackground';
import GlassmorphicView from '../components/GlassmorphicView';
import colors from '../config/colors';

// Dummy Data
const DUMMY_CLUBS = [
  {
    id: '1',
    name: 'Coding Club',
    description: 'We build apps, websites, and hack things together.',
    logo: 'https://img.icons8.com/color/96/source-code.png',
    members: 120,
  },
  {
    id: '2',
    name: 'Photography Society',
    description: 'Capture the moment. Weekly photo walks and workshops.',
    logo: 'https://img.icons8.com/color/96/slr-camera.png',
    members: 85,
  },
  {
    id: '3',
    name: 'Music Band',
    description: 'Jam sessions every Friday. All instruments welcome!',
    logo: 'https://img.icons8.com/color/96/musical-notes.png',
    members: 45,
  },
  {
    id: '4',
    name: 'Robotics Team',
    description: 'Building the future, one servo at a time.',
    logo: 'https://img.icons8.com/color/96/robot-3.png',
    members: 30,
  },
  {
    id: '5',
    name: 'Debate Club',
    description: 'Speak your mind. Logic and rhetoric training.',
    logo: 'https://img.icons8.com/color/96/microphone.png',
    members: 60,
  },
];

export default function ClubListScreen({ navigation }) {

  // Logic for the "Join" button
  const handleJoin = (clubName) => {
    Alert.alert('Joined!', `You are now following ${clubName}`);
  };

  // Logic for clicking the Card -> Goes to Chat
  const handleOpenChat = (club) => {
    navigation.navigate('ClubChat', {
      clubId: club.id,
      clubName: club.name
    });
  };

  const renderClub = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => handleOpenChat(item)}
      style={styles.cardWrapper}
    >
      <GlassmorphicView style={styles.card} intensity={30}>
        <View style={styles.cardContent}>
          {/* Logo */}
          <Image source={{ uri: item.logo }} style={styles.logo} />

          {/* Text Info */}
          <View style={styles.textContainer}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={styles.members}>{item.members} members</Text>
          </View>
        </View>

        {/* Join Button (Does not navigate, just joins) */}
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => handleJoin(item.name)}
        >
          <Text style={styles.joinText}>Join</Text>
        </TouchableOpacity>
      </GlassmorphicView>
    </TouchableOpacity>
  );

  return (
    <SpaceBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore Clubs</Text>
        </View>

        <FlatList
          data={DUMMY_CLUBS}
          renderItem={renderClub}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Lobster_400Regular',
    color: colors.white,
  },
  list: {
    padding: 15,
  },
  cardWrapper: {
    marginBottom: 15,
  },
  card: {
    padding: 20,
    borderRadius: 25,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  members: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  joinText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16
  },
});