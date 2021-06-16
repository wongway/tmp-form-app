import * as Camera from "expo-camera";
import React from "react";

import { Button, StyleSheet, Text, View, ScrollView, ActivityIndicator } from "react-native";
import { Image } from "react-native-elements";

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { LoadingView } from "./src/LoadingView";
import { ModelView } from "./src/ModelView";
import { WorkoutView } from "./src/WorkoutView";
import { useTensorFlowLoaded } from "./src/useTensorFlow";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ title: 'Welcome' }}
        />
        <Stack.Screen name="Workout" component={WorkoutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const WelcomeScreen = ({ navigation }) => {
  return (
    <ScrollView>
      <Text style={styles.titleText}>Choose Your Workout</Text>
      <WorkoutView 
      />
      {/* <Button
        title="Start Workout"
        disabled
        onPress={() => navigation.navigate('Workout', {})} /> */}
      <Text style={styles.titleText}>Activity Log</Text>
      <Image 
        source={require('./src/assets/placeholder.jpeg')}
        style={{ width: '90%', height: 200, marginHorizontal: 20 }}
        PlaceholderContent={<ActivityIndicator />}
      />
      <Text style={{ marginHorizontal: 20 }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </Text>
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

const styles = StyleSheet.create({
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 5,
    marginHorizontal: 20,
  }
});