import React from "react";

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { WelcomeView } from "../views/WelcomeView";
import { FormBottomTabNavigator } from "./FormTabNavigator";

const Stack = createNativeStackNavigator();

const LoginStackNavigator = () => {
    return (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeView} />
            <Stack.Screen name="Tabs" component={FormBottomTabNavigator} />
          </Stack.Navigator>
    );
}

export { LoginStackNavigator };