import React from "react";

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { WelcomeView } from "../views/WelcomeView";
import { FormBottomTabNavigator } from "./FormTabNavigator";
import { EditProfileScreen, RegistrationScreen } from "../screens/RegistrationScreen";

const Stack = createNativeStackNavigator();

const LoginStackNavigator = () => {
    return (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeView} />
            <Stack.Screen name="Registration" component={RegistrationScreen} />
            <Stack.Screen name="Complete Registration" component={EditProfileScreen} />
            <Stack.Screen name="Tabs" component={FormBottomTabNavigator} />
          </Stack.Navigator>
    );
}

export { LoginStackNavigator };