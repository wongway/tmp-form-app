import React from 'react';
import { View, Text, Button, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { Card, ListItem } from 'react-native-elements';
import { Entypo } from '@expo/vector-icons';

import { useChannels } from '../providers/ChannelsProvider';
import styles from '../stylesheet';
import loremText from '../utils/lorem';

export const WorkoutInfoScreen = ({ route, navigation }) => {
    const { workout_id } = route.params;
    const { getWorkoutById } = useChannels();

    const workout = getWorkoutById(workout_id);

    return (
        <SafeAreaView style={styles.baseContainer}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.titleText}>{workout.name}</Text>
                    <Text style={styles.normalBlockText}>{workout.description ? workout.description : loremText}</Text>
                    <Text style={styles.h2Text}>Circuit</Text>
                    <Card containerStyle={styles.card}>
                        {
                            workout.steps.map((step, i) => {
                                return (
                                    <ListItem key={i} bottomDivider>
                                        <ListItem.Content>
                                            <ListItem.Title>{step.name}</ListItem.Title>
                                        </ListItem.Content>
                                        <ListItem.Content right>
                                            <ListItem.Subtitle>
                                                {step.type == 'RepWorkoutStep' ? 'x' + step.count : step.duration + ' sec'}
                                            </ListItem.Subtitle>
                                        </ListItem.Content>
                                        {/* <Text style={[styles.normalBlockText, { fontWeight: "bold"}]} key={i}>
                        <Entypo name="chevron-right" size={12} />
                        </Text> */}
                                    </ListItem>
                                )
                            })
                        }
                        <ListItem key={workout.steps.length}>
                            <ListItem.Content style={{ alignItems: 'center' }}>
                                <ListItem.Title>
                                    <Entypo name="cycle" size={20} /> x {workout.sets}
                                </ListItem.Title>
                            </ListItem.Content>
                        </ListItem>
                    </Card>
                    <View style={styles.bottom}>
                        <Pressable
                            style={styles.loginButtonDark}
                            onPress={() => navigation.navigate('Workout', { workout_id: workout_id, repCounter: true })}
                            onLongPress={() => navigation.navigate('Fake Workout', { workout_id: workout_id })} >
                            <Text style={styles.loginButtonText}>
                                START WORKOUT
                            </Text>
                        </Pressable>
                        {/* <Pressable
                            style={styles.loginButtonDark}
                            onPress={() => navigation.navigate('Workout', { workout_id: workout_id, repCounter: false })} >
                            <Text style={styles.loginButtonText}>
                                Start Workout without Rep Counter
                            </Text>
                        </Pressable> */}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};