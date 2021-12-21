import { Button, View, Text, ScrollView } from "react-native";
import styles from "../stylesheet";

import { useChannels } from "../providers/ChannelsProvider";
import { useAuth } from "../providers/AuthProvider";
import { Avatar } from "react-native-elements";

export const UserProfileScreen = () => {
    const { user, signOut } = useAuth();
    const { getUserByAppId } = useChannels();

    const onSignOut = async () => {
        navigation.replace('Welcome');
        await signOut();
    }

    if (!user) {
        return (
            <Text> Not logged in </Text>
        )
    }

    const formUser = getUserByAppId(user.id);

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
                <Text style={styles.titleText}> { formUser.name } </Text>
            </View>
            <Text style={{ marginHorizontal: 20, marginVertical: 10 }}>
                Logged in as: { user.id } ({ user.profile.email })
            </Text>
            <Button onPress={onSignOut} title='Logout' />
        </ScrollView>
    )
}