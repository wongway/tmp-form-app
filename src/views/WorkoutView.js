import React, { Component, useState } from "react";
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TouchableHighlight, TouchableWithoutFeedback } from "react-native";
import { Tile, Image, Button, ButtonGroup, Rating } from "react-native-elements";
import { FontAwesome, Entypo } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

import { useChannels } from "../providers/ChannelsProvider";

import styles from "../stylesheet";

export const WorkoutView = () => {
    const { workouts } = useChannels();
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
                onPress={() => navigation.navigate('Workout Details', { name: workout.name, workout: workout })} 
                // title={props.title}
                // style={workoutStyles.button}
                activeOpacity={0.5}>
                <Image 
                    style={styles.button}
                    // source={props.image}
                    source={image_url ? { uri: image_url } : {}}
                    PlaceholderContent={<ActivityIndicator />}
                >
                    <TouchableWithoutFeedback onPress={() => { console.log("*boop*"); fav ? setFav(false) : setFav(true) }}>
                        <FontAwesome name={fav ? "heart" : "heart-o"} style={styles.workoutFav} />
                    </TouchableWithoutFeedback>
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
    const { workout } = route.params;

    return (
        <View style={{flex: 1}}>
            <Text style={styles.titleText}>{workout.name}</Text>
            <Text style={styles.h2Text}>Set <Entypo name="cycle" size={20} /> { workout.sets } </Text> 
            {
                workout.steps.map((step, i) => {
                    return(<Text style={[styles.normalBlockText, { fontWeight: "bold"}]} key={i}>
                        <Entypo name="chevron-right" size={12} />
                        {step.count}{step.type == 'reps' ? 'x' : ' sec'} {step.name}
                        </Text>)
                })
            }
            <View style={styles.bottom}>
            <Button
                // style={styles.workoutDetailStartButton}
                title="Start Workout"
                // disabled
                onPress={() => navigation.navigate('Workout', {})} /></View>
        </View>
    );
};
