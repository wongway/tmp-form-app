import React from 'react';
import { View } from 'react-native';
import { useChannels } from "./ChannelsProvider";

export type Props = {
    workoutlog_id: string;
}

interface WDContextInterface {
    addWorkoutData: (string) => void,
};

const WorkoutDataContext = React.createContext<WDContextInterface>(null);

const WorkoutDataProvider: React.FC = ({
    children
}) => {
    const { getWorkoutLogById } = useChannels();
    const addWorkoutData = (workoutlog_id: string) => {
        console.log("=> addWorkoutData");
    };

    return(
        <WorkoutDataContext.Provider value={{
            addWorkoutData: addWorkoutData,
        }}>
            {children}
        </WorkoutDataContext.Provider>
    );

};

const useWorkoutData = () => {
    const workoutData = React.useContext(WorkoutDataContext);
    if (workoutData == null) {
        throw new Error("useWorkoutData() called outside of a WorkoutDataProvider?");
    }
    return workoutData;
};

export { WorkoutDataProvider, useWorkoutData };