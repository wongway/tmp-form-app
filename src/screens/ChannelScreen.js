import { View, Text, Pressable, ScrollView, SafeAreaView } from "react-native";
import styles from "../stylesheet";
import { FontAwesome } from "@expo/vector-icons";

import { WorkoutView } from "../views/WorkoutView";
import { useChannels } from "../providers/ChannelsProvider";
import { useEffect, useState } from "react";

export const ChannelScreen = ({ route, navigation }) => {
    const { channel_id } = route.params;
    const { getChannelById, getFollowedChannelStatus, addFollowedChannel, removeFollowedChannel } = useChannels();

    const channel = getChannelById(channel_id);
    const followed = getFollowedChannelStatus(channel_id);
    const [fav, setFav] = useState(followed);
    console.log("Channel Screen:", channel_id, channel);

    useEffect(() => {
        return () => {
            // console.log("Closing channel screen:", followed, fav);
            if (fav != followed) {
                if (fav) {
                    addFollowedChannel(channel_id);
                } else {
                    removeFollowedChannel(channel_id);
                }
            }

        };
    }, [fav]);

    return (
        <SafeAreaView style={styles.baseContainer}>
            <ScrollView style={styles.scrollView}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.titleText}>{channel.name}</Text>
                    <Pressable style={styles.followBtn} onPress={() => { fav ? setFav(false) : setFav(true) }}>
                        <View style={styles.followBtnView}>
                            <FontAwesome name={fav ? "heart" : "heart-o"} style={styles.followIcon} />
                            <Text style={styles.followBtnText}>{fav ? "" : " Follow"}</Text>
                        </View>
                    </Pressable>
                </View>
                <Text style={styles.normalBlockText}>{channel.description}</Text>
                <Text style={styles.h2Text}>Workouts</Text>

                <WorkoutView channel_id={channel_id} />

            </ScrollView>
        </SafeAreaView>
    );
};