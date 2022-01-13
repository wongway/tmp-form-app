import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Alert, Pressable, Image } from "react-native";

import { useAuth } from "../providers/AuthProvider";
import styles from "../stylesheet";

export function WelcomeView({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, signUp, signIn } = useAuth();

  useEffect(() => {
    // If there is a user logged in, go to the Projects page.
    if (user != null) {
      console.log("Tabbing in after login");
      navigation.reset({
        index: 0,
        routes: [{ name: "Tabs" }]
      });
    }
  }, [user]);

  // The onPressSignIn method calls AuthProvider.signIn with the
  // email/password in state.
  const onPressSignIn = async () => {
    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert(`Failed to sign in: ${error.message}`);
    }
  };

  // The onPressSignUp method calls AuthProvider.signUp with the
  // email/password in state and then signs in.
  const onPressSignUp = async () => {
    navigation.navigate("Registration", { })
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' }}>
      <Image
        style={{ height: 150, width: 150, marginBottom: 30 }}
        // style={styles.button}
        // source={props.image}
        source={require("../../assets/icon.png")}
      />

      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={setEmail}
          value={email}
          placeholder="email"
          style={styles.inputStyle}
          autoCapitalize="none"
        />
      </View>
      <View style={{ ...styles.inputContainer, marginBottom: 30 }}>
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          placeholder="password"
          style={styles.inputStyle}
          secureTextEntry
        />
      </View>
      <Pressable style={styles.loginButton} onPress={onPressSignIn}>
        <Text style={styles.loginButtonText}>Login </Text>
      </Pressable>
      <Text>-or-</Text>
      <Pressable style={styles.loginButton} onPress={onPressSignUp}>
        <Text style={styles.loginButtonText}>Sign Up</Text>
      </Pressable>
    </View>
  );
}