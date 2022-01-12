import React, { useContext, useState, useEffect, useRef } from "react";
import Realm from "realm";
import ObjectID from "bson-objectid";
// import { Channel } from "../datamodel/datamodel";
// import { ChannelSchema, WorkoutSchema } from "../datamodel/schema";
// import { workoutlog, workoutlogSchema } from "../datamodel/WorkoutLogSchema";

import { useAuth } from "./AuthProvider";

import { PARTITION_VALUE } from "../formConfig";

const ChannelsContext = React.createContext(null);

const ChannelsProvider = ({ children }) => {
  const [channels, setChannels] = useState([]);
  const [currentChannelId, setCurrentChannelId] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const { user } = useAuth();

  // Use a Ref to store the realm rather than the state because it is not
  // directly rendered, so updating it should not trigger a re-render as using
  // state would.
  const realmRef = useRef(null);

  useEffect(() => {
    if (!user) {
      console.log("Error: user isn't logged in");
      return;
    }

    const config = {
      sync: {
        user: user,
        // schema: [ChannelSchema, WorkoutSchema],
        partitionValue: PARTITION_VALUE,
        error: (_session, error) => {
          (error) => {
            console.log("Sync error:", error.name, error.message);
          };
        },
      },
    };

    // console.log("Opening realm");
    console.log("User: ", user.id);

    // open a realm for this particular project
    Realm.open(config).then((projectRealm) => {
      realmRef.current = projectRealm;
      console.log("Realm:", projectRealm);

      const syncChannels = projectRealm.objects("Channel");
      let sortedChannels = syncChannels.sorted("name");
      setChannels([...sortedChannels]);
      console.log("Channels:", sortedChannels.length);
      console.log(sortedChannels);
      sortedChannels.addListener(() => {
        setChannels([...sortedChannels]);
      });

      // console.log("Users:", projectRealm.objects("User"));

      const syncWorkoutLogs = projectRealm.objects("WorkoutLog");//.filtered('user_id == $0', Realm.BSON.ObjectId(user.id));
      let sortedWorkoutLogs = syncWorkoutLogs.sorted("end_time", true);
      setWorkoutLogs([...sortedWorkoutLogs]);
      console.log("Workout Logs:", sortedWorkoutLogs.length, sortedWorkoutLogs);
      sortedWorkoutLogs.addListener(() => {
        setWorkoutLogs([...sortedWorkoutLogs]);
      });
    });

    return () => {
      // cleanup function
      console.log("Cleaning up realm connection for channels");
      const projectRealm = realmRef.current;
      if (projectRealm) {
        projectRealm.close();
        realmRef.current = null;
        setChannels([]);
      }
    };
  }, [user]);

  useEffect(() => {
    const realm = realmRef.current;
    if (!realm) {
      console.log("Error: Realm not connected");
      return;
    }

    const syncWorkouts = realm.objects("Workout");
    let sortedWorkouts = syncWorkouts.sorted("name");
    setWorkouts(sortedWorkouts);
    console.log("Workouts:", sortedWorkouts.length, sortedWorkouts);
    sortedWorkouts.addListener(() => {
      setWorkouts(sortedWorkouts);
    });

    return () => {
      setWorkouts(null);
    };

  }, [currentChannelId]);

  const getChannel = (channel_id) => {
    const realm = realmRef.current;

    if (!realm) {
      console.log("Error: realm not open");
      return null;
    }

    const channelResults =  realm.objects("Channel").filtered('_id == $0', channel_id);

    if (channelResults.length > 1) {
      console.log("Error: more than 1 channel has channel_id of", channel_id);
      return null;
    }

    if (channelResults.length == 1) {
      return channelResults[0];
    }

    console.log("Error: NO channels with id", channel_id);
    return null;
  }

  const getDocumentsById = (documentType, id, id_field) => {
    id_field = id_field || "_id";
    const realm = realmRef.current;

    if (!realm) {
      console.log("Error: realm not open");
      return null;
    }
    
    const filter_string = `${id_field} == $0`
    // console.log(filter_string);

    // console.log(realm.objects(documentType));
    const results = realm.objects(documentType).filtered(filter_string, Realm.BSON.ObjectId(id));
    // const results = realm.objects(documentType).filtered('$0 == $1', id_field, id);
    // const results = realm.objects(documentType).filtered(id_field + ' == ' + id);
    // const results = realm.objects(documentType).filtered(`${id_field} == ${id}`);
    // console.log(results);

    return results;
  }

  const getDocumentById = (documentType, id, id_field) => {
    const results = getDocumentsById(documentType, id, id_field);

    if (results.length > 1) {
      console.log("Error: more than 1 document has _id of", id);
      return null;
    }

    if (results.length == 1) {
      return results[0];
    }

    console.log("Error: NO documents with id", id);
    return null;
  }

  const getChannelById = (id) => {
    return getDocumentById("Channel", id);
  }

  const getUserById = (id) => {
    return getDocumentById("User", id);
  }

  const getWorkoutById = (id) => {
    return getDocumentById("Workout", id);
  }

  const getWorkoutLogById = (id) => {
    return getDocumentById("WorkoutLog", id);
  }

  const getWorkoutsByChannelId = (channel_id) => {
    return getDocumentsById("Workout", channel_id, "channel_id");
  }

  const getUserByAppId = (app_id) => {
    const realm = realmRef.current;
    if (!realm) {
      return null;
    }

    const results = realm.objects("User").filtered('user_id == $0', app_id);

    if (results.length > 1) {
      console.log("Error: more than 1 document has _id of", app_id);
      return null;
    }

    if (results.length == 1) {
      return results[0];
    }

    console.log("Error: NO users with app_id", app_id);
    return null;
  }

  const createNewUser = () => {
    const projectRealm = realmRef.current;
    if (!projectRealm) {
      return false;
    }
    console.log("Creating new user:", user.id);
    projectRealm.write(() => {
      // Create a new task in the same partition -- that is, in the same project.
      projectRealm.create(
        "User",
        {
          _id: ObjectID(user.id),
          user_id: user.id,
          realm_id: PARTITION_VALUE,
          name: user.profile.name,
          email: user.profile.email,
          is_creator: false,
          followed_channels: [],

        }
      );
    });
  };

  // const setTaskStatus = (task, status) => {
  //   // One advantage of centralizing the realm functionality in this provider is
  //   // that we can check to make sure a valid status was passed in here.
  //   if (
  //     ![
  //       Task.STATUS_OPEN,
  //       Task.STATUS_IN_PROGRESS,
  //       Task.STATUS_COMPLETE,
  //     ].includes(status)
  //   ) {
  //     throw new Error(`Invalid status: ${status}`);
  //   }
  //   const projectRealm = realmRef.current;

  //   projectRealm.write(() => {
  //     task.status = status;
  //   });
  // };

  // Define the function for deleting a task.
  // const deleteChannel = (channel) => {
  //   const projectRealm = realmRef.current;
  //   projectRealm.write(() => {
  //     projectRealm.channel(channel);
  //     setChannels([...projectRealm.objects("Channel").sorted("name")]);
  //   });
  // };

  // Render the children within the TaskContext's provider. The value contains
  // everything that should be made available to descendants that use the
  // useTasks hook.
  return (
    <ChannelsContext.Provider
      value={{
        // createChannel,
        // deleteChannel,
        currentChannelId,
        setCurrentChannelId,
        getChannel,
        workouts,
        channels,
        workoutLogs,
        getChannelById,
        getWorkoutById,
        getWorkoutLogById,
        getWorkoutsByChannelId,
        getUserById,
        getUserByAppId,
        createNewUser,
        realmRef,
      }}
    >
      {children}
    </ChannelsContext.Provider>
  );
};

// The useTasks hook can be used by any descendant of the TasksProvider. It
// provides the tasks of the TasksProvider's project and various functions to
// create, update, and delete the tasks in that project.
const useChannels = () => {
  const channel = useContext(ChannelsContext);
  if (channel == null) {
    throw new Error("useChannels() called outside of a ChannelsProvider?"); // an alert is not placed because this is an error for the developer not the user
  }
  return channel;
};

export { ChannelsProvider, useChannels };