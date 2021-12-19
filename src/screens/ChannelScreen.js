import { View, Text } from "react-native";
import styles from "../stylesheet";

import { WorkoutView } from "../views/WorkoutView";
import { useChannels } from "../providers/ChannelsProvider";

export const ChannelScreen = ({ route, navigation }) => {
    const { channel_id } = route.params;
    const { setCurrentChannelId, getChannel } = useChannels();

    setCurrentChannelId(channel_id);
    channel = getChannel(channel_id);
    console.log(channel);

    return (
        <View style={{flex: 1}}>
            <Text style={styles.titleText}> {channel.name} </Text>
            <Text> {channel.description} </Text>

            <WorkoutView />
            {/* <Image
                style={{width: "100%", height: 300}}
                source={workout.image}
                PlaceholderContent={<ActivityIndicator />}
                >
                <Text style={styles.workoutDetailTitle}>
                    {workout.title}
                </Text>
            </Image> */}
            {/* <View style={styles.bottom}> */}
            {/* <Button
                // style={styles.workoutDetailStartButton}
                title="Start Workout"
                // disabled
                onPress={() => navigation.navigate('Workout', {})} /></View> */}
        </View>
    );
};