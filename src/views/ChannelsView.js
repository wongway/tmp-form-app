import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Badge, Card, ListItem, Avatar } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../providers/AuthProvider";
import { useChannels } from "../providers/ChannelsProvider";

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

                        const channel = getChannel(channel_id);

                        const image_url = `https://i.pravatar.cc/64?u=${channel._id}`;
                        return (
                            <TouchableOpacity key={i}>
                                <ListItem key={i} bottomDivider onPress={() => navigation.navigate("Channel", { name: channel.name, channel_id: channel._id.toHexString() })}>
                                    <Avatar
                                        size="small"
                                        rounded
                                        source={image_url ? { uri: image_url } : {}}
                                        activeOpacity={0.7}
                                    />
                                    <ListItem.Content>
                                        <ListItem.Title>{channel.name}</ListItem.Title>
                                        <ListItem.Subtitle>{channel.description}</ListItem.Subtitle>
                                    </ListItem.Content>
                                    {/* <Badge value="PR" status="primary" /> */}
                                    {/* <Badge value="OR" status="error" /> */}
                                </ListItem></TouchableOpacity>)
                    })
                }
            </Card>
        );
    }

    return (
        <Card containerStyle={styles.card} >
            {
                channels.map((channel, i) => {

                    const image_url = `https://i.pravatar.cc/64?u=${channel._id}`;
                    return (
                        <TouchableOpacity key={i}>
                            <ListItem key={i} bottomDivider onPress={() => navigation.navigate("Channel", { name: channel.name, channel_id: channel._id.toHexString() })}>
                                <Avatar
                                    size="small"
                                    rounded
                                    source={image_url ? { uri: image_url } : {}}
                                    activeOpacity={0.7}
                                />
                                <ListItem.Content>
                                    <ListItem.Title>{channel.name}</ListItem.Title>
                                    <ListItem.Subtitle>{channel.description}</ListItem.Subtitle>
                                </ListItem.Content>
                                {/* <Badge value="PR" status="primary" /> */}
                                {/* <Badge value="OR" status="error" /> */}
                            </ListItem></TouchableOpacity>)
                })
            }
        </Card>
    );
};