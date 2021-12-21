import React from "react";
import { TouchableOpacity } from "react-native";
import { Badge, Card, ListItem, Avatar } from "react-native-elements";

import { useChannels } from "../providers/ChannelsProvider";
import { useNavigation } from "@react-navigation/native";

export const ChannelsView = () => {
    const { channels } = useChannels();
    const navigation = useNavigation();

    return (
        <Card containerStyle={{padding: 0}} >
        {
            channels.map((channel, i) => {

                const image_url = `https://i.pravatar.cc/64?u=${channel._id}`;
                return (
                    <TouchableOpacity key={i}>
                    <ListItem key={i} bottomDivider onPress={() => navigation.navigate("Channel", { name: channel.name, channel_id: channel.channel_id })}>
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