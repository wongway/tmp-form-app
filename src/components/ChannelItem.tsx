import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Text, ListItem, Avatar } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import { useChannels } from "../providers/ChannelsProvider";

export type ChannelItemProps = {
  channel_id: string;
}

export const ChannelItem: React.FC<ChannelItemProps> = ({ channel_id }) => {
  const { getChannel } = useChannels();
  const navigation = useNavigation();

  const channel = getChannel(channel_id);

  const image_url = `https://i.pravatar.cc/64?u=${channel._id}`;

  return (
    <TouchableOpacity key={channel._id}>
      <ListItem key={channel._id} bottomDivider 
      onPress={() => navigation.navigate("Channel" as never, { name: channel.name, channel_id: channel._id.toHexString() } as never)}>
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
      </ListItem></TouchableOpacity>
  );
}
