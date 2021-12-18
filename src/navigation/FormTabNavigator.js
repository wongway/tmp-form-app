import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { ChannelStackNavigator, FeedStackNavigator, ProfileStackNavigator   } from "./FormStackNavigator";

const Tab = createBottomTabNavigator();

export const FormBottomTabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Channels" component={ChannelStackNavigator} />
      <Tab.Screen name="Activity Feed" component={FeedStackNavigator} />
      <Tab.Screen name="Profile" disabled component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};