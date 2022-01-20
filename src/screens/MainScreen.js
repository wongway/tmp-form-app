import React from "react";
import { Text, ScrollView } from "react-native";

import { ChannelsView } from "../views/ChannelsView";

import styles from "../stylesheet";

export const MainScreen = ({ navigation }) => {

  return (
    <ScrollView>
      <Text style={styles.titleText}>Your Channels</Text>
      <ChannelsView followed="true" />
      <Text style={styles.titleText}>Suggested Channels</Text>
      <ChannelsView />
      {/* <Text style={{ marginHorizontal: 20, marginVertical: 10 }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </Text> */}
    </ScrollView>
  )
}