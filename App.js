import * as Camera from "expo-camera";
import React, { useState, useRef, useEffect } from "react";

import { Button, StyleSheet, Text, View, ScrollView, ActivityIndicator } from "react-native";
import { Image } from "react-native-elements";

import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoadingView } from "./src/views/LoadingView";
import { ModelView } from "./src/views/ModelView";
import { WorkoutView, WorkoutDetailScreen } from "./src/views/WorkoutView";
import { ActivityFeedView } from "./src/views/ActivityFeedView";
import { WelcomeView } from "./src/views/WelcomeView";
import { useTensorFlowLoaded } from "./src/useTensorFlow";

import { AuthProvider, useAuth } from "./src/providers/AuthProvider";
// import { ChannelsProvider, useChannels } from "./src/providers/ChannelsProvider";

import { ChannelItem } from "./src/components/ChannelItem";

// const Stack = createStackNavigator();
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      {/* <ChannelsProvider> */}
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Welcome" component={WelcomeView} />
              <Stack.Screen
                name="Main"
                component={MainScreen}
                options={{ title: 'Main' }}
              />
            <Stack.Screen name="Workout" component={WorkoutScreen} />
            <Stack.Screen name="Workout Details" component={WorkoutDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      {/* </ChannelsProvider> */}
    </AuthProvider>  );
};

const MainScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  // const { channels } = useChannels();
  const [channels, setChannels] = useState([]);

  // Use a Ref to store the realm rather than the state because it is not
  // directly rendered, so updating it should not trigger a re-render as using
  // state would.
  const realmRef = useRef(null);

  useEffect(() => {
    if (!user) {
      console.log("Error: user isn't logged in");
      return;
    }

    const config = {
      sync: {
        user: user,
        partitionValue: "form",
        error: (_session, error) => {
          (error) => {
            console.log("Sync error:", error.name, error.message);
          };
        },
      },
    };

    // open a realm for this particular project
    Realm.open(config).then((projectRealm) => {
      realmRef.current = projectRealm;

      const syncChannels = projectRealm.objects("Channel");
      console.log("Synced channels:", syncChannels.length);
      console.log(syncChannels);
      let sortedChannels = syncChannels.sorted("name");
      // sortedChannels.map((object, index, collection) => {
      //   console.log("Channel", index, object.name);
      // });
      setChannels([...sortedChannels]);

      sortedChannels.addListener(() => {
        // console.log("Collection update on channels");
        setChannels([...sortedChannels]);
      });
    });

    return () => {
      // cleanup function
      const projectRealm = realmRef.current;
      if (projectRealm) {
        projectRealm.close();
        realmRef.current = null;
        setChannels([]);
      }
    };
  }, [user]);

  console.log("User: ", user, user.profile);

  const onSignOut = async () => {
    await signOut();
  }

  return (
    <ScrollView>
      <Text style={styles.titleText}>Your Channels</Text>
      <View>
        {channels.map((channel) => {
          if (channel) {
            return(<ChannelItem key={channel._id} channel={channel} />);
          }
        })}
      </View>

      {/* <WorkoutView 
      /> */}
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
        Logged in as: { user.id } ({ user.profile.email })
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

const styles = StyleSheet.create({
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 5,
    marginHorizontal: 20,
  }
});