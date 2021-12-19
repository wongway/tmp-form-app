import React from "react";
import { TouchableOpacity } from "react-native";
import { Badge, Card, ListItem, Avatar } from "react-native-elements";

import ColorHash from 'color-hash';

var colorHash = new ColorHash();

const activityFeedData = [
    {
        user: "Sally Sitsup",
        activity: "did custom workout",
    },
    {
        user: "Reggie Rowmeo",
        activity: "did workout HIIT Abs",
    },
    {
        user: "Larry Lifter",
        activity: "did workout Bicycles",
    },
    {
        user: "Sally Sitsup",
        activity: "worked out 4 days in a row!",
    },
];

export const ActivityFeedView = () => {
    return (
        <Card containerStyle={{padding: 0}} >
        {
            activityFeedData.map((data, i) => {
                return (
                    <TouchableOpacity key={i}>
                    <ListItem key={i} bottomDivider>
                        <Avatar
                            size="small"
                            rounded
                            overlayContainerStyle={{backgroundColor: colorHash.hex(data.user)}}
                            title={data.user[0]}
                            onPress={() => console.log("Works!")}
                            activeOpacity={0.7}
                        />
                        <ListItem.Content>
                            <ListItem.Title>{data.user}</ListItem.Title>
                            <ListItem.Subtitle>{data.activity}</ListItem.Subtitle>
                        </ListItem.Content>
                        <Badge value="PR" status="primary" />
                        {/* <Badge value="OR" status="error" /> */}
                    </ListItem></TouchableOpacity>)
            })
        }
        </Card>
    );
};

{/* <Avatar
  size="small"
  rounded
  title="MT"
  onPress={() => console.log("Works!")}
  activeOpacity={0.7}
/> */}