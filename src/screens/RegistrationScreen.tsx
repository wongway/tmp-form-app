import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { useChannels } from '../providers/ChannelsProvider';

import styles from '../stylesheet';

export const RegistrationScreen = ({ navigation }) => {
    const { user, signUp, signIn } = useAuth();
    const { updateFullname } = useChannels();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    // useEffect(() => {
    //     if (user != null) {
    //         console.log("Tabbing in after registration");
    //         navigation.reset({
    //             index: 0,
    //             routes: [{ name: "Tabs" }]
    //         });
    //     }
    // }, [user]);

    const onPressSignUp = async () => {
        if (!email || !password ) {
            Alert.alert("All fields are required");
        } else if (password != passwordConfirm) {
            Alert.alert("Passwords do not match");
        } else {
            try {
                await signUp(email, password);
                signIn(email, password).then((result) => {
                    console.log("Trying to complete registration")
                    navigation.navigate("Complete Registration");
                });
            } catch (error) {
                Alert.alert(`Failed to sign up: ${error.message}`);
            }
        }
    };

    return (
        <View style={styles.loginContainer}>
            <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <Text style={styles.titleText}>Register</Text>
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    onChangeText={setEmail}
                    value={email}
                    placeholder="Email"
                    style={styles.inputStyle}
                    autoCapitalize="none"
                />
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    placeholder="Password"
                    style={styles.inputStyle}
                    secureTextEntry
                />
            </View>
            <View style={{ ...styles.inputContainer, marginBottom: 30 }}>
                <TextInput
                    onChangeText={(text) => setPasswordConfirm(text)}
                    value={passwordConfirm}
                    placeholder="Confirm Password"
                    style={styles.inputStyle}
                    secureTextEntry
                />
            </View>
            <Pressable style={styles.loginButton} onPress={onPressSignUp}>
                <Text style={styles.loginButtonText}>Submit</Text>
            </Pressable>

        </View>
    );
};

export const EditProfileScreen = ({ navigation, route }) => {
    const { user, signUp, signIn } = useAuth();
    const { updateFullname } = useChannels();
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");

    const onSubmit = () => {
        if (!firstname || !lastname) {
            Alert.alert("All fields are required");
        } else {
            updateFullname(firstname, lastname);
            navigation.reset({
                index: 0,
                routes: [{ name: "Tabs" }]
            });
        }
    }

    return (
        <View style={styles.loginContainer}>
            <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <Text style={styles.titleText}>Edit Profile</Text>
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    onChangeText={setFirstname}
                    value={firstname}
                    placeholder="First Name"
                    style={styles.inputStyle}
                    autoCapitalize="words"
                />
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    onChangeText={setLastname}
                    value={lastname}
                    placeholder="Last Name"
                    style={styles.inputStyle}
                    autoCapitalize="words"
                />
            </View>
            <Pressable style={styles.loginButton} onPress={onSubmit}>
                <Text style={styles.loginButtonText}>Update Profile</Text>
            </Pressable>
        </View>
    );

};