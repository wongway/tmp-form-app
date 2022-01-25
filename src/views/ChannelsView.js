import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Badge, Card, ListItem, Avatar } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import Realm from "realm";
import { FontAwesome } from "@expo/vector-icons";

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
                    {/* <Card containerStyle={{marginTop: 5, paddingHorizontal: 30}}> */}

                    {/* <ListItem key={1}>
                        <ListItem.Content>
                            <ListItem.Title>Welcome!</ListItem.Title>
                            <Card.Divider />
                            <ListItem.Subtitle>
                                You aren't following any channels yet. To 
                                get started, check out beginner workouts in our 
                                officlal Form channel "The Basics" or explore other 
                                channels from our affiliate trainers below!
                            </ListItem.Subtitle>
                        </ListItem.Content>
                    </ListItem> */}

                    {/* <Card.Title>
                        Find your new favorite workout in the channels below!
                    </Card.Title>
                    <Card.Title><FontAwesome name="arrow-circle-down" size={24} color="gray" /></Card.Title> */}

                    <ListItem key={1}>
                        <ListItem.Title >
                            <FontAwesome name="arrow-circle-down" size={36} color="gray" />
                        </ListItem.Title>
                        <ListItem.Content>
                        <ListItem.Title>
                            {/* <FontAwesome name="arrow-circle-down" size={24} color="gray" /> */}
                            <Text style={styles.colorDarkOrange}>Welcome!</Text>
                        </ListItem.Title>
                        <ListItem.Subtitle>
                            Find your new favorite workout by exploring channels below
                        </ListItem.Subtitle></ListItem.Content>
                    </ListItem>

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