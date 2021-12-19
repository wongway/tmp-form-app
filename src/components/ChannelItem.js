import React, { useState } from "react";
import { Text, ListItem } from "react-native-elements";
// import { useChannels } from "../providers/ChannelsProvider";
// import { ActionSheet } from "./ActionSheet";
// import { Channel } from "../datamodel/datamodel";

export function ChannelItem({ channel }) {
//   const { channels } = useChannels();

//   // For each possible status other than the current status, make an action to
//   // move the task into that status. Rather than creating a generic method to
//   // avoid repetition, we split each status to separate each case in the code
//   // below for demonstration purposes.
//   if (task.status !== "" && task.status !== Task.STATUS_OPEN) {
//     actions.push({
//       title: "Mark Open",
//       action: () => {
//         setTaskStatus(task, Task.STATUS_OPEN);
//       },
//     });
//   }
//   if (task.status !== Task.STATUS_IN_PROGRESS) {
//     actions.push({
//       title: "Mark In Progress",
//       action: () => {
//         setTaskStatus(task, Task.STATUS_IN_PROGRESS);
//       },
//     });
//   }
//   if (task.status !== Task.STATUS_COMPLETE) {
//     actions.push({
//       title: "Mark Complete",
//       action: () => {
//         setTaskStatus(task, Task.STATUS_COMPLETE);
//       },
//     });
//   }

  return (
    <>
      {/* <ActionSheet
        visible={actionSheetVisible}
        closeOverlay={() => {
          if (task.status) {
            setActionSheetVisible(false);
          }
        }}
        actions={actions}
      /> */}
        <ListItem key={channel.channel_id} bottomDivider> 
            <ListItem.Content> 
                <ListItem.Title> {channel.name} </ListItem.Title>
                <ListItem.Subtitle> {channel.description} </ListItem.Subtitle>
            </ListItem.Content> 
        </ListItem>
    </>
  );
}
