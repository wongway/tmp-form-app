import React, { Component, useState } from "react";
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TouchableHighlight, TouchableWithoutFeedback } from "react-native";
import { Tile, Image, Button, ButtonGroup, Rating } from "react-native-elements";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

import { useChannels } from "../providers/ChannelsProvider";

// const workoutsData = [
//     {
//         title: "10-Week Glut Guarantee",
//         creator: "squatmaven",
//         duration: "10",
//         fav: true,
//         image: require("../assets/anastase-maragos-9dzWZQWZMdE-unsplash.jpeg"),
//     },
//     {
//         title: "HIIT Abs",
//         creator: "sixpacksam",
//         duration: "12",
//         fav: false,
//         image: require("../assets/mathilde-langevin-aLpt9nRnnDQ-unsplash.jpeg"),
//     },
//     {
//         title: "Pull Up Party",
//         creator: "monkeygirl21",
//         duration: "8",
//         fav: false,
//         image: require("../assets/damir-spanic-22L7do1cOho-unsplash.jpeg"),
//     },
//     {
//         title: "Bicycles",
//         creator: "mynameissoverylong",
//         duration: "999",
//         fav: true,
//         image: require("../assets/mor-shani-li4dxZ0KYRw-unsplash.jpeg"),
//     },
// ];

// export class WorkoutViewOld extends Component {
//     constructor() {
//         super();
//         this.state = {
//             selectedIndex: 0
//         }
//         this.updateIndex = this.updateIndex.bind(this)
//     }
      
//     updateIndex (selectedIndex) {
//         this.setState({selectedIndex})
//     }

//     getWorkoutTiles (selectedIndex) {
//         const tileList = workoutsData.map((workout) => {
//             if (selectedIndex != 0 || workout.fav) {
//                 return (
//                     <WorkoutTile 
//                         key={workout.title} 
//                         title={workout.title} 
//                         image={workout.image}
//                         creator={workout.creator} 
//                         duration={workout.duration} 
//                         fav={workout.fav}
//                         workout={workout}
//                     />
//                 );
//             }         
//         });

//         return (<>{tileList}</>);
//     }
      
//     render() {
//         const buttons = ['Favorites', 'Custom', 'Trending'];
//         const { selectedIndex } = this.state;

//         return (
//             <View style={{marginHorizontal: 10}}>
//                 <ButtonGroup 
//                     // width="100%"
//                     onPress={this.updateIndex}
//                     selectedIndex={selectedIndex}
//                     buttons={buttons}
//                     containerStyle={{height: 30}}
//                 />
//                 <View style={styles.container}>
//                     {this.getWorkoutTiles(selectedIndex)}
//                     {/* <View style={{height: 150, width: '50%', backgroundColor: 'powderblue'}} />
//                     <View style={{height: 150, width: '50%', backgroundColor: 'skyblue'}} />
//                     <View style={{height: 150, width: '50%', backgroundColor: 'steelblue'}} />
//                     <View style={{height: 150, width: '50%', backgroundColor: 'powderblue'}} /> */}

//                 </View>
//             </View>

//         );
//     }
// };

export const WorkoutView = () => {
    const { workouts } = useChannels();
    const image_asset = require("../assets/anastase-maragos-9dzWZQWZMdE-unsplash.jpeg");
    return(
        <View style={{marginHorizontal: 10}}>
            <View style={styles.container}>
            {
                workouts.map((workout, i) => {
                    return(
                        <WorkoutTile
                            key={i}
                            title={workout.name} 
                            image={image_asset}
                            creator={workout.channel_id._id} 
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
                    source={props.image}
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
