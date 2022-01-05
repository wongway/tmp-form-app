import React from "react";
import { View, Text, Image } from "react-native";
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
        // headerShown: false,
        headerStyle: {
          // backgroundColor: "#F2A649",
          height: 40,
        },
        headerTitle: (props) => (
          <View style={{ 
            // backgroundColor: "lightgray", 
            padding: 0, 
            justifyContent: "center", 
            flexDirection: "row" 
          }} >
            <Text style={{ fontSize: 20, fontFamily: "FreeLine" }} > form </Text>
          {/* <Image 
            style={{ width: 70,  resizeMode: "contain" }}
            source={require("../../assets/form-logo-black.png")} /> */}
            </View>
        )
      })}
      >
      <Tab.Screen name="Channels" component={ChannelStackNavigator} />
      <Tab.Screen name="Feed" component={FeedStackNavigator} />
      <Tab.Screen name="Profile" disabled component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};