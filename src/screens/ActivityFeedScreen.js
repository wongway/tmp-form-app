import React from "react";

import { Button, Text, ScrollView } from "react-native";

import { ActivityFeedView } from "../views/ActivityFeedView";

import styles from "../stylesheet";

export const ActivityFeedScreen = ({ navigation }) => {

  return (
    <ScrollView>

      <Text style={styles.titleText}>Recent Activity</Text>
      <ActivityFeedView />
      {/* <Text style={{ marginHorizontal: 20, marginVertical: 10 }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </Text> */}
    </ScrollView>
  )
}