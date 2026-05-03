// navigation/AppNavigator.js

import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import Context
import { UserContext } from '../context/UserContext';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import FeedScreen from '../screens/FeedScreen';
import ClubListScreen from '../screens/ClubListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OtpScreen from '../screens/OtpScreen';
import ClubChatScreen from '../screens/ClubChatScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import LostFoundScreen from '../screens/LostFoundScreen';
import EventsScreen from '../screens/EventsScreen';
import FindProfessorScreen from '../screens/FindProfessorScreen';
import ChatListScreen from '../screens/ChatListScreen';
import CampusMapScreen from '../screens/CampusMapScreen';
import colors from '../config/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Bottom Tab Navigator ---
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Feed') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'Clubs') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Clubs" component={ClubListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// --- Main Stack Navigator ---
export default function AppNavigator() {
  const { isLoggedIn } = useContext(UserContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
          // IF LOGGED IN
          <>
            <Stack.Screen
              name="Home"
              component={AppTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ClubChat"
              component={ClubChatScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CreatePost"
              component={CreatePostScreen}
              options={{
                headerShown: false,
                presentation: 'modal',
                animation: 'slide_from_bottom'
              }}
            />
            <Stack.Screen
              name="UserProfile"
              component={UserProfileScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="LostFound"
              component={LostFoundScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Events"
              component={EventsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FindProfessor"
              component={FindProfessorScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChatList"
              component={ChatListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CampusMap"
              component={CampusMapScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // IF LOGGED OUT
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Create Account' }} />
            <Stack.Screen name="Otp" component={OtpScreen} options={{ title: 'Verify Email' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}