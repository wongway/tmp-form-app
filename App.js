import * as Camera from "expo-camera";
import React, { useState, useRef, useEffect } from "react";

import { Button, StyleSheet, Text, View, ScrollView, ActivityIndicator } from "react-native";
import { Image } from "react-native-elements";

import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ChannelsView } from "./src/views/ChannelsView";
import { LoadingView } from "./src/views/LoadingView";
import { ModelView } from "./src/views/ModelView";
import { WorkoutView, WorkoutDetailScreen } from "./src/views/WorkoutView";
import { ActivityFeedView } from "./src/views/ActivityFeedView";
import { WelcomeView } from "./src/views/WelcomeView";
import { useTensorFlowLoaded } from "./src/useTensorFlow";

import { AuthProvider, useAuth } from "./src/providers/AuthProvider";
import { ChannelsProvider } from "./src/providers/ChannelsProvider";
import { ChannelScreen } from "./src/screens/ChannelScreen";

import styles from "./src/stylesheet";

// const Stack = createStackNavigator();
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <ChannelsProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Welcome" component={WelcomeView} />
              <Stack.Screen
                name="Main"
                component={MainScreen}
                options={{ title: 'Form' }}
              />
            <Stack.Screen name="Workout" component={WorkoutScreen} />
            <Stack.Screen name="Workout Details" component={WorkoutDetailScreen} options={({ route }) => ({ title: route.params.name })}/>
            <Stack.Screen name="Channel" component={ChannelScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ChannelsProvider>
    </AuthProvider>  );
};

const MainScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();

  if (user) { console.log("User: ", user, user.profile); }

  const onSignOut = async () => {
    navigation.replace('Welcome');
    await signOut();
  }

  return (
    <ScrollView>
      <Text style={styles.titleText}>Your Channels</Text>
      <ChannelsView />

      {/* <Button
        title="Start Workout"
        disabled
        onPress={() => navigation.navigate('Workout', {})} /> */}

      <Text style={styles.titleText}>Activity Feed</Text>
      <ActivityFeedView />
      {/* <Image 
        source={require('./src/assets/placeholder.jpeg')}
        style={{ width: '90%', height: 200, marginHorizontal: 20 }}
        PlaceholderContent={<ActivityIndicator />}
      /> */}
      <Text style={{ marginHorizontal: 20, marginVertical: 10 }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </Text>
      <Text style={{ marginHorizontal: 20, marginVertical: 10 }}>
        {/* {
          if (user) { return ( */}
            Logged in as: { user.id } ({ user.profile.email })
          {/* )}

        } */}
      </Text>
      <Button onPress={onSignOut} title='Logout' />
    </ScrollView>
  )
}

const WorkoutScreen = ({ navigation, route }) => {
  const isLoaded = useTensorFlowLoaded();

  const [hasPermission, setHasPermission] = React.useState(null);
  const [type, setType] = React.useState(Camera.Constants.Type.back);


  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (!hasPermission) {
    return <LoadingView>Camera permission is required to continue</LoadingView>;
  }
  if (!isLoaded) {
    return <LoadingView>Loading TensorFlow</LoadingView>;
  }

  return <ModelView />;
};
