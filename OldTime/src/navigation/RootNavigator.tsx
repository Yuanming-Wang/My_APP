import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  HomeScreen, CreateScreen, StoriesScreen,
  GeneratingScreen, ReaderScreen, ShareScreen,
  CollaborateScreen, HelpScreen, CollectionScreen,
} from '../screens';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../lib/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          paddingBottom: 20,
          height: 80,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{
        tabBarLabel: '回忆',
        tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
      }} />
      <Tab.Screen name="Collection" component={CollectionScreen} options={{
        tabBarLabel: '收藏馆',
        tabBarIcon: ({ focused }) => <TabIcon emoji="📚" focused={focused} />,
      }} />
      <Tab.Screen name="Help" component={HelpScreen} options={{
        tabBarLabel: '求助',
        tabBarIcon: ({ focused }) => <TabIcon emoji="👨‍👩‍👧" focused={focused} />,
      }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Create" component={CreateScreen} />
        <Stack.Screen name="Stories" component={StoriesScreen} />
        <Stack.Screen name="Generating" component={GeneratingScreen} />
        <Stack.Screen name="Reader" component={ReaderScreen} />
        <Stack.Screen name="Share" component={ShareScreen} />
        <Stack.Screen name="Collaborate" component={CollaborateScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
