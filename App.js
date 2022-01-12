import React, { useState, useRef, useEffect } from "react";

import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from "./src/providers/AuthProvider";
import { ChannelsProvider } from "./src/providers/ChannelsProvider";

import styles from "./src/stylesheet";
import { FormStackNavigator } from "./src/navigation/FormStackNavigator";
import { FormBottomTabNavigator } from "./src/navigation/FormTabNavigator";
import { WorkoutDataProvider } from "./src/providers/WorkoutDataProvider";

// const Stack = createStackNavigator();
// const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <ChannelsProvider>
        <WorkoutDataProvider>
        <NavigationContainer>
          {/* <FormStackNavigator /> */}
          <FormBottomTabNavigator />
        </NavigationContainer>
        </WorkoutDataProvider>
      </ChannelsProvider>
    </AuthProvider>  );
};