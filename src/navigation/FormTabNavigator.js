import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { ChannelStackNavigator, FeedStackNavigator, ProfileStackNavigator   } from "./FormStackNavigator";

import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export const FormBottomTabNavigator = () => {
  return (
    <Tab.Navigator 
    screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Profile') {
            iconName = focused
              ? 'person-circle'
              : 'person-circle-outline';
          } else if (route.name === 'Channels') {
            iconName = focused ? 'tv' : 'tv-outline';
          } else if (route.name === 'Feed') {
            iconName = focused ? 'pulse' : 'pulse-outline';
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#F2790F',
        // tabBarActiveTintColor: '#BD3886',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
        headerShown: false,
      })}
      >
      <Tab.Screen name="Channels" component={ChannelStackNavigator} />
      <Tab.Screen name="Feed" component={FeedStackNavigator} />
      <Tab.Screen name="Profile" disabled component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};