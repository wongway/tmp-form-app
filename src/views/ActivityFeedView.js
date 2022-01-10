import React from "react";
import { TouchableOpacity } from "react-native";
import { Text, Badge, Card, ListItem, Avatar } from "react-native-elements";

import { useChannels } from "../providers/ChannelsProvider";

import { timeAgoString } from "../utils/TimeElapsed";

export const ActivityFeedView = () => {
    const { workoutLogs, getUserById, getWorkoutById } = useChannels();

    return (
        <Card containerStyle={{padding: 0}} >
        {
            workoutLogs.map((workoutLog, i) => {
                if (!workoutLog){
                    return (<Text>No logs</Text>)
                }

                const user = getUserById(workoutLog.user_id);
                const workout = getWorkoutById(workoutLog.workout_id);

                const image_url = `https://i.pravatar.cc/64?u=${user._id}`;

                const time_delta = timeAgoString(workoutLog.end_time);

                return (
                    <TouchableOpacity key={(i)}>
                        <ListItem key={i} bottomDivider>
                            <Avatar
                                size="small"
                                rounded
                                source={image_url ? { uri: image_url } : {}}
                                onPress={() => console.log("Works!")}
                                activeOpacity={0.7}
                            />
                            <ListItem.Content>
                                <ListItem.Title>{user.name}</ListItem.Title>
                                <ListItem.Subtitle>completed {workout.name}</ListItem.Subtitle>
                            </ListItem.Content>
                            <ListItem.Content right>
                                <Text>{time_delta} ago </Text>
                            </ListItem.Content>
                        </ListItem>   
                    </TouchableOpacity>
                )
            })
        }
        </Card>
    );
};