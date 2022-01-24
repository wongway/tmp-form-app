import React from 'react';
// import ObjectID from 'bson-objectid';
import { BSON } from 'realm';

import { useAuth } from './AuthProvider';
import { useChannels } from "./ChannelsProvider";
import { WorkoutData, WorkoutLog, WorkoutLogStep } from "../datamodel/schema";

import { PARTITION_VALUE } from "../formConfig";

interface WDContextInterface {
    createWorkoutLog: (string) => void,
    completeWorkoutLog: (string) => void,
    addWorkoutLogStep: (string, WorkoutLogStep) => void,
    addWorkoutData: (string, WorkoutData) => void,
};

const WorkoutDataContext = React.createContext<WDContextInterface>(null);

const WorkoutDataProvider: React.FC = ({
    children
}) => {
    const { user } = useAuth();
    const { realmRef, getWorkoutLogById } = useChannels();

    const createWorkoutLog = (workout_id) => {
        const realm = realmRef.current;
        if (!realm) {
            return false;
        }

        const newlog: WorkoutLog = {
            _id: new BSON.ObjectId(),
            realm_id: PARTITION_VALUE,
            user_id: new BSON.ObjectId(user.id),
            workout_id: new BSON.ObjectId(workout_id),
            start_time: new Date(Date.now()),
            data: [],
            steps: [],
        };

        console.log("WorkoutLog:", newlog);

        realm.write(() => {
        realm.create(
            "WorkoutLog",
            newlog
        )
        });

        return newlog._id;
    };

    const completeWorkoutLog = (workoutlog_id) => {
        const realm = realmRef.current;
        if (!realm) {
        return false;
        }

        const workoutLog = getWorkoutLogById(workoutlog_id);
        if (!workoutLog) {
        return false;
        }

        realm.write(() => {
            workoutLog.end_time = new Date(Date.now())
        });
    }

    const addWorkoutLogStep = async (workoutlog_id, workoutStep) => {
        const realm = realmRef.current;
        if (!realm) {
        return false;
        }

        // console.log("addWorkoutStepLog:", workoutStep);

        const workoutLog = getWorkoutLogById(workoutlog_id);
        if (!workoutLog) {
            return false;
        }

        const newStep = {
            ...workoutStep,
            index: workoutLog.steps.length
        };

        realm.write(() => {
        workoutLog.steps.push(newStep);
        });
    }    

    const addWorkoutData = async (workoutlog_id: string, data: WorkoutData) => {
        const realm = realmRef.current;
        if (!realm) {
            return false;
        }

        const workoutLog = getWorkoutLogById(workoutlog_id);
        if (!workoutLog) { return false; }

        // console.log("=> addWorkoutData");

        realm.write(() => {
            workoutLog.data.push(data);
        })
    };

    return(
        <WorkoutDataContext.Provider value={{
            createWorkoutLog: createWorkoutLog,
            completeWorkoutLog: completeWorkoutLog,
            addWorkoutLogStep: addWorkoutLogStep,
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