import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Badge, Card, ListItem, Avatar } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import Realm from "realm";

import { useAuth } from "../providers/AuthProvider";
import { useChannels } from "../providers/ChannelsProvider";

import { ChannelItem } from "../components/ChannelItem";

import styles from "../stylesheet";

export const ChannelsView = (props) => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { channels, getUserByAppId, getChannel, favChannels } = useChannels();
    const followed = props.followed;

    if (followed) {
        if (!favChannels || favChannels.length == 0) {
            return (
                <Card containerStyle={styles.card}>
                    <Text> No followed channels</Text>
                </Card>
            );
        }

        return (
            <Card containerStyle={styles.card}>
                {
                    favChannels.map((channel_id, i) => {
                        return (
                            <ChannelItem key={i} channel_id={channel_id} />
                        );
                    })
                }
            </Card>
        );
    }

    return (
        <Card containerStyle={styles.card} >
            {
                channels.map((channel, i) => {
                    // console.log(favChannels[0], typeof(favChannels[0]), channel._id, typeof(channel._id.toHexString()), favChannels[0] == channel._id.toHexString());
                    // console.log(favChannels.findIndex(i => i == channel._id.toHexString()));

                    if (favChannels.findIndex(i => i == channel._id.toHexString()) != -1) {
                        return;
                    } else {

                    return (
                            <ChannelItem key={i} channel_id={channel._id} />
                    );
                    }
                })
            }
        </Card>
    );
};