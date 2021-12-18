import React from "react";

import { Button, Text, ScrollView } from "react-native";

import { ChannelsView } from "../views/ChannelsView";

import { useAuth } from "../providers/AuthProvider";

import styles from "../stylesheet";

export const MainScreen = ({ navigation }) => {
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

      {/* <Text style={styles.titleText}>Activity Feed</Text>
      <ActivityFeedView /> */}
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