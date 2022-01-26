import { useEffect, useState, useRef } from "react";
import { Pressable, View, Text, ScrollView } from "react-native";
import { Avatar } from "react-native-elements";
import { Calendar } from 'react-native-calendars';

import { useChannels } from "../providers/ChannelsProvider";
import { useAuth } from "../providers/AuthProvider";

import styles from "../stylesheet";

export const UserProfileScreen = ({ route, navigation }) => {
    const { user, signOut } = useAuth();
    const { getUserByAppId, getWorkoutLogsByUserId } = useChannels();
    const [markedDates, setMarkedDates] = useState({});

    const onSignOut = async () => {
        navigation.replace('Welcome');
        await signOut();
    }

    if (!user) {
        return (
            <Text> Not logged in </Text>
        )
    }

    const formUser = getUserByAppId(user.id);

    if (!formUser) {
        return (
            <Text>
                ERROR: User (${user.id}) does not have a form user
            </Text>
        )
    }

    function formatFirstDayOfTheMonth(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            // day = '' + d.getDate(),
            day = '' + 1,
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return new Date([year, month, day].join('-'));
    }

    function formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            // day = '' + 1,
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }

    const workoutLogs = getWorkoutLogsByUserId(formUser._id).filtered('end_time >= $0', formatFirstDayOfTheMonth(Date.now()));
    let newDates = {}
    workoutLogs.map((workoutLog, i) => {
        newDates[formatDate(workoutLog.end_time)] = { marked: true, dotColor: '#F2790F'};
    });

    // setMarkedDates(newDates);


    const image_url = `https://i.pravatar.cc/64?u=${user.id}`;

    return (
        <ScrollView style={styles.scrollView}>
            <View style={{ justifyContent: "center", alignItems: "center", marginTop: 20 }}>
                <Avatar
                    size="large"
                    rounded
                    source={image_url ? { uri: image_url } : {}}
                    activeOpacity={0.7}
                />
                <Text style={styles.titleText}>{formUser.name ? formUser.name : "Jane Doe"}</Text>
                {/* <Text style={styles.normalBlockText}>Joined Jan 2022</Text> */}
            </View>
            {/* <Text style={{ marginHorizontal: 20, marginVertical: 10 }}>
                Logged in as: {user.id} ({user.profile.email})
            </Text> */}
            <View style={{ paddingHorizontal: 20 }}>
                {/* <Text style={styles.h2Text}>Activity</Text> */}
                <Calendar
                    hideArrows={true}
                    disableMonthChange={true}

                    // markedDates={{
                    //     '2022-01-24': { marked: true },
                    //     '2022-01-23': { marked: true, dotColor: "orange" },
                    // }}
                    // markedDates={markedDates}
                    markedDates={newDates}
                />
            <View style={{ justifyContent: "center", alignItems: "center", marginTop: 20 }}>
                <Pressable style={styles.loginButtonDark} onPress={onSignOut}>
                    <Text style={styles.loginButtonText}>LOGOUT</Text>
                </Pressable>
            </View>
            </View>


        </ScrollView>
    )
}