import React from "react";
import { TouchableOpacity } from "react-native";
import { Badge, Card, ListItem, Avatar } from "react-native-elements";

import { useChannels } from "../providers/ChannelsProvider";
import { useNavigation } from "@react-navigation/native";

import ColorHash from 'color-hash';

var colorHash = new ColorHash();

export const ChannelsView = () => {
    const { channels } = useChannels();
    const navigation = useNavigation();

    return (
        <Card containerStyle={{padding: 0}} >
        {
            channels.map((channel, i) => {
                return (
                    <TouchableOpacity key={i}>
                    <ListItem key={i} bottomDivider onPress={() => navigation.navigate("Channel", { channel })}>
                        <Avatar
                            size="small"
                            rounded
                            overlayContainerStyle={{backgroundColor: colorHash.hex(channel.name)}}
                            title={channel.name[0]}
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