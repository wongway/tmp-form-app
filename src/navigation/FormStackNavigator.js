import React from "react";

import { Button, View, Text } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainScreen } from "../screens/MainScreen";
import { FakeWorkoutScreen, WorkoutDetailScreen, WorkoutSummaryScreen } from "../views/WorkoutView";
import { WelcomeView } from "../views/WelcomeView";
import { ChannelScreen } from "../screens/ChannelScreen";
import { WorkoutScreen } from "../screens/WorkoutScreen";
import { ActivityFeedScreen } from "../screens/ActivityFeedScreen";
import { UserProfileScreen } from "../screens/UserProfileScreen";

import { useAuth } from "../providers/AuthProvider";

const Stack = createNativeStackNavigator();

const ChannelStackNavigator = () => {
    return (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeView} />
              <Stack.Screen
                name="Main"
                component={MainScreen}
              />
            <Stack.Screen name="Workout" component={WorkoutScreen} />
            <Stack.Screen name="Workout Details" component={WorkoutDetailScreen} options={({ route }) => ({ title: route.params.name })}/>
            <Stack.Screen name="Workout Summary" component={WorkoutSummaryScreen} options={({ route }) => ({ title: route.params.name })}/>
            <Stack.Screen name="Channel" component={ChannelScreen} />
            <Stack.Screen name="Fake Workout" component={FakeWorkoutScreen} />
          </Stack.Navigator>
    );
}

const FeedStackNavigator = () => {
    return (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen
                name="Activity Feed"
                component={ActivityFeedScreen}
              />
          </Stack.Navigator>
    );
}

const ProfileStackNavigator = () => {
    const { user, signOut } = useAuth();

    const onSignOut = async () => {
        navigation.replace('Welcome');
        await signOut();
    }

    if (!user) {
        return (
            <Text> Not logged in </Text>
        )
    }

    return (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen
                name="User Profile"
                component={UserProfileScreen}
              />
          </Stack.Navigator>
    );
}

export { ChannelStackNavigator, FeedStackNavigator, ProfileStackNavigator }