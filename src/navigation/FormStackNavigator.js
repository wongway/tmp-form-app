import React from "react";

import { View, Text } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainScreen } from "../screens/MainScreen";
import { WorkoutDetailScreen } from "../views/WorkoutView";
import { WelcomeView } from "../views/WelcomeView";
import { ChannelScreen } from "../screens/ChannelScreen";
import { WorkoutScreen } from "../screens/WorkoutScreen";
import { ActivityFeedScreen } from "../screens/ActivityFeedScreen";

const Stack = createNativeStackNavigator();

const ChannelStackNavigator = () => {
    return (
          <Stack.Navigator>
            <Stack.Screen name="Welcome" component={WelcomeView} />
              <Stack.Screen
                name="Main"
                component={MainScreen}
              />
            <Stack.Screen name="Workout" component={WorkoutScreen} />
            <Stack.Screen name="Workout Details" component={WorkoutDetailScreen} options={({ route }) => ({ title: route.params.name })}/>
            <Stack.Screen name="Channel" component={ChannelScreen} />
          </Stack.Navigator>
    );
}

const FeedStackNavigator = () => {
    return (
          <Stack.Navigator>
              <Stack.Screen
                name="Activity Feed"
                component={ActivityFeedScreen}
              />
          </Stack.Navigator>
    );
}

const ProfileStackNavigator = () => {
    return (
        <View><Text> Profile ! </Text></View>
    );
}

export { ChannelStackNavigator, FeedStackNavigator, ProfileStackNavigator }