import React from "react";

import { Button, Text, ScrollView, SafeAreaView } from "react-native";

import { ActivityFeedView } from "../views/ActivityFeedView";

import styles from "../stylesheet";

export const ActivityFeedScreen = ({ navigation }) => {

  return (
    <SafeAreaView style={styles.baseContainer}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.titleText}>Recent Activity</Text>
        <ActivityFeedView />
      </ScrollView>
    </SafeAreaView>
  )
}