import * as Camera from "expo-camera";
import React from "react";

import { LoadingView } from "../views/LoadingView";
import { ModelView, ModelViewNoPrediction } from "../views/ModelView";
import { useTensorFlowLoaded } from "../useTensorFlow";

import styles from "../stylesheet";

export const WorkoutScreen = ({ navigation, route }) => {
  const { repCounter } = route.params;
  const isLoaded = useTensorFlowLoaded();

  const [hasPermission, setHasPermission] = React.useState(null);
  const [type, setType] = React.useState(Camera.Constants.Type.back);


  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (!hasPermission) {
    return <LoadingView>Camera permission is required to continue</LoadingView>;
  }
  if (!isLoaded) {
    return <LoadingView>Loading TensorFlow</LoadingView>;
  }

  if (repCounter) {
    return <ModelView />;
  } else {
    return <ModelViewNoPrediction />;
  }
};
