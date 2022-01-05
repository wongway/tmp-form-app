import React from "react";

import { Image, Button, Text, ScrollView } from "react-native";

import { ChannelsView } from "../views/ChannelsView";

import { useAuth } from "../providers/AuthProvider";

import styles from "../stylesheet";

export const MainScreen = ({ navigation }) => {

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
        source={require('../../assets/form-logo-black.png')}
        style={{ marginHorizontal: 20 }}
        // PlaceholderContent={<ActivityIndicator />}
      /> */}
      <Text style={{ marginHorizontal: 20, marginVertical: 10 }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </Text>
    </ScrollView>
  )
}