import React, { Component, useState, useRef, useEffect } from "react";
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TouchableHighlight, TouchableWithoutFeedback, Pressable } from "react-native";
import { Tile, Image, Button, ButtonGroup, Rating } from "react-native-elements";
import { FontAwesome, Entypo } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

import { useChannels } from "../providers/ChannelsProvider";
import { useWorkoutData } from "../providers/WorkoutDataProvider";

import styles from "../stylesheet";

export const WorkoutView = (props) => {
    const { getWorkoutsByChannelId } = useChannels();

    const workouts = getWorkoutsByChannelId(props.channel_id);

    console.log(props, workouts);

    return(
        <View style={{marginHorizontal: 10}}>
            <View style={styles.container}>
            {
                workouts.map((workout, i) => {
                    console.log("Workout:", workout);
                    return(
                        <WorkoutTile
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
            </View>
        </View>
    );
}

const WorkoutTile = (props) => {
    const [fav, setFav] = useState(props.fav);
    const navigation = useNavigation();
    const workout = props.workout;

    const image_url = `https://picsum.photos/seed/${workout._id}/200/200`;

    return (
        <View style={styles.workoutTile}>
            <TouchableOpacity 
                style={{alignItems: 'center'}}
                onPress={() => navigation.navigate('Workout Details', { name: workout.name, workout_id: workout._id.toHexString() })} 
                // title={props.title}
                // style={workoutStyles.button}
                activeOpacity={0.5}>
                <Image 
                    style={styles.button}
                    // source={props.image}
                    source={image_url ? { uri: image_url } : {}}
                    PlaceholderContent={<ActivityIndicator />}
                >
                    {/* <TouchableWithoutFeedback onPress={() => { console.log("*boop*"); fav ? setFav(false) : setFav(true) }}>
                        <FontAwesome name={fav ? "heart" : "heart-o"} style={styles.workoutFav} />
                    </TouchableWithoutFeedback> */}
                </Image>

            </TouchableOpacity>
            <Text style={{ width: '90%', fontWeight: 'bold' }}>
                {props.title}
            </Text>
            <View style={{ width: '90%', flex: 1, flexDirection: 'row', justifyContent: 'space-between' }} >
                <Text>{props.creator}</Text>
                <Text>{props.duration} min</Text>
            </View>
        </View>
    );
};

export const WorkoutDetailScreen = ({ route, navigation }) => {
    const { workout_id } = route.params;
    const { getWorkoutById } = useChannels();

    const workout = getWorkoutById(workout_id);

    return (
        <View style={{flex: 1}}>
            <Text style={styles.titleText}>{workout.name}</Text>
            <Text style={styles.h2Text}>Set <Entypo name="cycle" size={20} /> { workout.sets } </Text> 
            {
                workout.steps.map((step, i) => {
                    return(<Text style={[styles.normalBlockText, { fontWeight: "bold"}]} key={i}>
                        <Entypo name="chevron-right" size={12} />
                        {step.count}{step.type == 'RepWorkoutStep' ? 'x' : ' sec'} {step.name}
                        </Text>)
                })
            }
            <View style={styles.bottom}>
            <Button
                // style={styles.workoutDetailStartButton}
                title="Start Workout with Rep Counter"
                // disabled
                onPress={() => navigation.navigate('Workout', { repCounter: true })} />
            <Button
                // style={styles.workoutDetailStartButton}
                title="Start Workout without Rep Counter"
                // disabled
                onPress={() => navigation.navigate('Workout', { repCounter: false })} />
            <Button
                // style={styles.workoutDetailStartButton}
                title="Fake this workout"
                // disabled
                onPress={() => navigation.navigate('Fake Workout', { workout_id: workout_id })} />
            </View>
        </View>
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
        <View style={{flex: 1}}>
            <Text style={styles.titleText}>{workout.name}</Text>
            <Text style={styles.h2Text}>Set <Entypo name="cycle" size={20} /> { workout.sets } </Text> 
            {
                workout.steps.map((step, i) => {
                    return (
                        <Pressable key={i} onPress={() => { 
                                console.log("DING!", {...step}); 
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
                            <Text style={[styles.normalBlockText, { fontWeight: "bold"}]} key={i}>
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
  