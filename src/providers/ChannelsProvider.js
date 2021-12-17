import React, { useContext, useState, useEffect, useRef } from "react";
import Realm from "realm";
// import { Channel } from "../datamodel/datamodel";
import { useAuth } from "./AuthProvider";

const ChannelsContext = React.createContext(null);

const ChannelsProvider = ({ children }) => {
  const [channels, setChannels] = useState([]);
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
        partitionValue: "form",
        error: (_session, error) => {
          (error) => {
            console.log("Sync error:", error.name, error.message);
          };
        },
      },
    };

    console.log("Opening realm");
    // open a realm for this particular project
    Realm.open(config).then((projectRealm) => {
      realmRef.current = projectRealm;

      const syncChannels = projectRealm.objects("Channel");
      let sortedChannels = syncChannels.sorted("name");
      setChannels([...sortedChannels]);
      sortedChannels.addListener(() => {
        setChannels([...sortedChannels]);
      });
    });
    console.log("Opened realm");

    return () => {
      // cleanup function
      const projectRealm = realmRef.current;
      if (projectRealm) {
        projectRealm.close();
        realmRef.current = null;
        setChannels([]);
      }
    };
  }, [user]);

  // const createChannel = (newChannelName) => {
  //   const projectRealm = realmRef.current;
  //   projectRealm.write(() => {
  //     // Create a new task in the same partition -- that is, in the same project.
  //     projectRealm.create(
  //       "Channel",
  //       new Channel({
  //         name: newChannelName || "New Channel",
  //         partition: "form",
  //       })
  //     );
  //   });
  // };

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
        channels,
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