import { Pressable, View, Text, ScrollView } from "react-native";
import styles from "../stylesheet";

import { useChannels } from "../providers/ChannelsProvider";
import { useAuth } from "../providers/AuthProvider";
import { Avatar } from "react-native-elements";

export const UserProfileScreen = ({route, navigation}) => {
    const { user, signOut } = useAuth();
    const { getUserByAppId, createNewUser } = useChannels();

    const onSignOut = async () => {
        navigation.replace('Welcome');
        await signOut();
    }

    if (!user) {
        return (
            <Text> Not logged in </Text>
        )
    }

    var formUser = getUserByAppId(user.id);

    if (!formUser) {
        createNewUser();
        formUser = getUserByAppId(user.id);
    }

    const image_url = `https://i.pravatar.cc/64?u=${user.id}`;

    return (
        <ScrollView>
            <View style={{ justifyContent: "center", alignItems: "center", marginTop: 20 }}>
                <Avatar
                    size="large"
                    rounded
                    source={image_url ? { uri: image_url } : {}}
                    activeOpacity={0.7}
                />
                <Text style={styles.titleText}> { formUser.name ? formUser.name : "Jane Doe" } </Text>
            </View>
            <Text style={{ marginHorizontal: 20, marginVertical: 10 }}>
                Logged in as: { user.id } ({ user.profile.email })
            </Text>
            <View style={{ justifyContent: "center", alignItems: "center", marginTop: 20 }}>
            <Pressable style={styles.loginButtonDark} onPress={onSignOut}>
                <Text style={styles.loginButtonText}>LOGOUT</Text>
            </Pressable>
            </View>

        </ScrollView>
    )
}