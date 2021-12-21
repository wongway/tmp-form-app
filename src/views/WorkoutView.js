import React, { Component, useState } from "react";
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TouchableHighlight, TouchableWithoutFeedback } from "react-native";
import { Tile, Image, Button, ButtonGroup, Rating } from "react-native-elements";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

import { useChannels } from "../providers/ChannelsProvider";

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
            {
                workout.steps.map((step, i) => {
                    return(<Text key={i}>{step.name} {step.count} {step.type}</Text>)
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

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    button: {
        aspectRatio: 1,
        borderRadius: 10,
        width: '90%',
        // marginHorizontal: 16
        // height: 50,
        // marginVertical: 10,
    },
    tile: {
        flex: 1,    
        marginHorizontal: 10,
        width: '45%',
    },
    tileImage: {
        aspectRatio: 1,
        borderRadius: 10,
        marginVertical: 10,
    },
    tileContent: {
        height: 100,
        width: "50%",
        backgroundColor: "#ccc",
    },
    duration: {
        fontWeight: "bold"
    },
    placeholder: {
        backgroundColor: "#ccc",
        // width: 100,
        // height: 100,
    },
    workoutTile: {
        // backgroundColor: "#ccc",
        width: '50%',
        alignItems: 'center',
        marginVertical: 5,
    },
    workoutFav: {
        margin: "5%",
        color: "#e31b23",
        fontSize: 18,
    },
    workoutDetailTitle: {
        marginTop: 10,
        marginLeft: 10,
        fontSize: 20,
        fontWeight: "bold", 
        color: "white",
    },
    bottom: {
        flex: 1,
        justifyContent: "flex-end",
        marginBottom: 20,
    },
});
