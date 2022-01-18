import React, { Component, useState, useRef, useEffect } from "react";
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { Button, Card, Avatar, ListItem, Badge } from "react-native-elements";
import { FontAwesome, Entypo } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

import { useChannels } from "../providers/ChannelsProvider";
import { useWorkoutData } from "../providers/WorkoutDataProvider";

import styles from "../stylesheet";

// import { WorkoutItem } from '../components/WorkoutItem';
// import { ListItem } from "react-native-elements/dist/list/ListItem";

export const WorkoutView = (props) => {
    const { getWorkoutsByChannelId } = useChannels();

    const workouts = getWorkoutsByChannelId(props.channel_id);

    console.log(props, workouts);

    return (
        <Card containerStyle={styles.card}>
            {
                workouts.map((workout, i) => {
                    // console.log("Workout:", workout);
                    return (
                        <WorkoutCard
                            key={i}
                            title={workout.name}
                            // image={image_asset}
                            creator={workout.channel_id.name}
                            duration={workout.sets}
                            fav={true}
                            workout={workout}
                        />
                    )
                })
            }
        </Card>
    );
}

const WorkoutCard = (props) => {
    const [fav, setFav] = useState(props.fav);
    const navigation = useNavigation();
    const workout = props.workout;

    const image_url = `https://picsum.photos/seed/${workout._id}/150/150`;

    return (
        <TouchableOpacity key={(workout._id)}
            onPress={() => navigation.navigate('Workout Details', { name: workout.name, workout_id: workout._id.toHexString() })}
            activeOpacity={0.5} >
            <ListItem key={workout._id} bottomDivider>
                <Avatar
                    size="large"
                    source={image_url ? { uri: image_url } : {}}
                    activeOpacity={0.7}
                />
                <ListItem.Content>
                    <ListItem.Title>{props.title}</ListItem.Title>
                    {/* <ListItem.Content><Text>Short descriptive text that's going to get you to try this workout</Text></ListItem.Content> */}
                    <ListItem.Subtitle style={{marginBottom: 5}}>{props.duration} min</ListItem.Subtitle>
                    <Badge badgeStyle={{paddingHorizontal: 2, backgroundColor: '#F2790F'}} value='#squats' />
                </ListItem.Content>
                <ListItem.Content right>
                    <ListItem.Chevron />
                </ListItem.Content>
            </ListItem>
        </TouchableOpacity>
    );
};

export const FakeWorkoutScreen = ({ route, navigation }) => {
    const { workout_id } = route.params;
    const { getWorkoutById } = useChannels();
    const { createWorkoutLog, completeWorkoutLog, addWorkoutLogStep, addWorkoutData } = useWorkoutData();

    const workoutlog_id = useRef(null);

    const workout = getWorkoutById(workout_id);

    useEffect(() => {
        workoutlog_id.current = createWorkoutLog(workout_id);

        return () => {
            console.log("Finishing workout log:", workoutlog_id.current);
            completeWorkoutLog(workoutlog_id.current);
            workoutlog_id.current = null;
        };
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <Text style={styles.titleText}>{workout.name}</Text>
            <Text style={styles.h2Text}>Set <Entypo name="cycle" size={20} /> {workout.sets} </Text>
            {
                workout.steps.map((step, i) => {
                    return (
                        <Pressable key={i} onPress={() => {
                            console.log("DING!", { ...step });
                            const time = new Date(Date.now());
                            addWorkoutLogStep(
                                workoutlog_id.current,
                                {
                                    type: step.type || "RepWorkoutStep",
                                    // index: 0,
                                    name: step.name,
                                    count: step.count,
                                    duration: step.duration,
                                    timestamp: time,
                                }
                            );
                            addWorkoutData(
                                workoutlog_id.current,
                                {
                                    timestamp: time,
                                    pose_data: [],
                                }
                            );
                        }}
                            style={({ pressed }) => [
                                {
                                    backgroundColor: pressed
                                        ? 'rgb(210, 230, 255)'
                                        : 'white'
                                },
                                my_styles.wrapperCustom
                            ]}>
                            <Text style={[styles.normalBlockText, { fontWeight: "bold" }]} key={i}>
                                <Entypo name="circle-with-plus" size={12} />
                                {step.count}{step.type == 'RepWorkoutStep' ? 'x' : ' sec'} {step.name}
                            </Text>
                        </Pressable>
                    );
                })
            }
        </View>
    );
};

const my_styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
    text: {
        fontSize: 16
    },
    wrapperCustom: {
        borderRadius: 8,
        padding: 6
    },
    logBox: {
        padding: 20,
        margin: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#f0f0f0',
        backgroundColor: '#f9f9f9'
    }
});
