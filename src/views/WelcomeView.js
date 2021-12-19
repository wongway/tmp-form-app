import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useAuth } from "../providers/AuthProvider";
import styles from "../stylesheet";

export function WelcomeView({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, signUp, signIn, signInAnonymous } = useAuth();

  useEffect(() => {
    // If there is a user logged in, go to the Projects page.
    if (user != null) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }]
      });
    }
  }, [user]);

  // The onPressSignIn method calls AuthProvider.signIn with the
  // email/password in state.
  const onPressSignIn = async () => {
    console.log("Press sign in");
    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert(`Failed to sign in: ${error.message}`);
    }
  };

  // The onPressSignUp method calls AuthProvider.signUp with the
  // email/password in state and then signs in.
  const onPressSignUp = async () => {
    try {
      await signUp(email, password);
      signIn(email, password);
    } catch (error) {
      Alert.alert(`Failed to sign up: ${error.message}`);
    }
  };

  const onPressSignInAnonymous = async () => {
    try {
      await signInAnonymous();
    } catch (error) {
      Alert.alert(`Failed to sign in: ${error.message}`);
    }

  }

  return (
    <View>
      <Text>Signup or Signin:</Text>
      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={setEmail}
          value={email}
          placeholder="email"
          style={styles.inputStyle}
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          placeholder="password"
          style={styles.inputStyle}
          secureTextEntry
        />
      </View>
      <View style={styles.fixToText}>
        <Button onPress={onPressSignIn} title="Sign In" />
        <Button onPress={onPressSignUp} title="Sign Up" />
        <Button onPress={onPressSignInAnonymous} title="Sign In as Guest" />
      </View>
    </View>
  );
}